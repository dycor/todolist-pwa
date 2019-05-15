import AppTask from '/js/components/task/task.js';
import { openDB } from 'idb';
import checkConnectivity from '/js/connection.js';
import { deleteTask, postTask } from '../api/task';
var uniqid = function() {
  return (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
};
var online  = true;
var queue = [];

async function deleteIdbTask(database,task) {
  var tasks = await database.get('tasks', 'tasks');

  tasks = tasks.filter( item => item.id != task.id);
  await database.put('tasks', tasks, 'tasks');

  if(online) {
    deleteTask(task.id)
  } else {
    // add queue
    queue.push({type:'delete',id:task.id});
  }
}

(async function(document) {
  const app = document.querySelector('#app');
  const skeleton = app.querySelector('.skeleton');
  const banner = app.querySelector('.disconnected');
  const listPage = app.querySelector('[page=list]');
  const btnAdd = app.querySelector('#task-btn');

  checkConnectivity(3, 1000);

  btnAdd.onclick = function () {
    const taskElement = new AppTask();
    const title = document.getElementById('task-title');
    const description = document.getElementById('task-description');

    taskElement.initTask(
      title.value,
      description.value);

    listPage.appendChild(taskElement);

    const newTask = {id:taskElement.id ,title: title.value, description:  description.value};

    if(online) {
      postTask(newTask);
    } else {
      // add queue
      queue.push({type:'add',task : newTask});
    }

    title.value = '';
    description.value = '';

  };
  
  document.addEventListener('connection-changed', ({ detail }) => {
    console.log('online',detail.online);
    online = detail.online;

    if(online){
      if(queue.length > 0) {
        queue.map(item => {
          if(item.type == 'delete'){
            deleteTask(item.id);
          }
          if(item.type == 'add'){
            postTask(item.task);
          }

        });
      }

      queue = [];

      banner.removeAttribute('active');

    } else {
      banner.setAttribute('active','');
    }
  });
  skeleton.removeAttribute('active');
  listPage.setAttribute('active', '');

  try {
    const data = await fetch('http://localhost:3000/tasks');
    const json = await data.json();


    const database = await openDB('app-store', 1, {
      upgrade(db) {
        db.createObjectStore('tasks');
      }
    });

    document.addEventListener('task-deleted', function (e) {
      deleteIdbTask(database,e.detail);
    }, false);


    if (navigator.onLine) {
      await database.put('tasks', json, 'tasks');
    }


    const tasks = json.map(item => {
      const taskElement = new AppTask();

      taskElement.initTask(
        item.title,
        item.description,
        item.id);

      listPage.appendChild(taskElement);

      return taskElement;
    });


    const callback = function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
        }
      });
    };

    const io = new IntersectionObserver(callback);

    tasks.forEach(card => {
      io.observe(card);
    });
  } catch (error) {
    const database = await openDB('app-store', 1, {
      upgrade(db) {
        db.createObjectStore('tasks');
      }
    });
    const tasks = await database.get('tasks', 'tasks');

    if(tasks){
      tasks.map(item => {
        const taskElement = new AppTask();

        taskElement.initTask(
          item.title,
          item.description);

        listPage.appendChild(taskElement);

        return taskElement;
      });
    }


  }
})(document);
