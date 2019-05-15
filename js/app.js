import AppTask from '/js/components/task/task.js';
import { openDB } from 'idb';
import checkConnectivity from '/js/connection.js';

var uniqid = function() {
  return (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
};

async function deleteIdbTask(database,task) {
  var tasks = await database.get('tasks', 'tasks');
  tasks = tasks.filter( item => item.id != task.task)
  // console.log('deleteIdbTask',task.task)
  console.log('deleteIdbTaskb tasks',tasks)
  await database.put('tasks', tasks, 'tasks');

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
    console.log('addTask nn', taskElement.id)

    fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id:taskElement.id ,title: title.value, description:  description.value})
    });

    title.value = '';
    description.value = '';

  };
  
  document.addEventListener('connection-changed', ({ detail }) => {
    console.log(detail.online);
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
      console.log('task deleted',e.detail)
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
    // console.error(error, ':(');
    tasks.map(item => {
      const taskElement = new AppTask();

      taskElement.initTask(
        item.title,
        item.description);

      listPage.appendChild(taskElement);

      return taskElement;
    });

  }
})(document);
