import AppTask from '/js/components/task/task.js';
import { openDB } from 'idb';
import checkConnectivity from '/js/connection.js';

var uniqid = function() {
  return (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
};
var online  = true;
var queue = [];


async function deleteIdbTask(database,task) {
  var tasks = await database.get('tasks', 'tasks');
  var myHeaders = new Headers();
  var myInit = { method: 'DELETE',
    headers: myHeaders,
    mode: 'cors',
  };

  tasks = tasks.filter( item => item.id != task.id);
  await database.put('tasks', tasks, 'tasks');

  if(online) {
    fetch(`http://localhost:3000/tasks/${task.id}`,myInit)
      .then(function(response) {
        return response.blob();
      });
  } else {
    // add queue
    queue.push({type:'delete',id:task.id});
  }
}

(async function(document) {
  const app = document.querySelector('#app');
  const skeleton = app.querySelector('.skeleton');
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
      fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
      });
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
      queue.map(item => {
        if(item.type == 'delete'){
          var myHeaders = new Headers();
          var myInit = { method: 'DELETE',
            headers: myHeaders,
            mode: 'cors',
          };
          fetch(`http://localhost:3000/tasks/${item.id}`,myInit)
            .then(function(response) {
              return response.blob();
            });
        }
        if(item.type == 'add'){
          fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.task)
          });
        }

      });

      queue = [];
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
    console.log('value >',tasks)

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
