export const deleteTask = (id) => {
  var myHeaders = new Headers();
  var myInit = { method: 'DELETE',
    headers: myHeaders,
    mode: 'cors',
  };

  fetch(`http://localhost:3000/tasks/${id}`,myInit)
    .then(function(response) {
      return response.blob();
    });
};

export const postTask = (task) => {
  fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(task)
  });
};