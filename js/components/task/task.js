import { LitElement, html, css } from 'lit-element';
// var taskCounter = 1;
var uniqid = function() {
  return (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
};
export default class AppTask extends LitElement {
  constructor() {
    super();
    this.id = "";
    this.title = "";
    this.description = "";
    // taskCounter++;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
      }
      
      .btn-danger {
        color: #fff;
        background-color: #d9534f;
        border-color: #d43f3a;
        border-radius: 0.5rem;
      }   

      .task {
        position: relative;
        margin-bottom: 12px;
        overflow: hidden;
        border-radius: 5px;
        box-shadow: var(--app-header-shadow);
        margin: 1rem;
        padding: 1rem;
      }
      .task a {
        display: block;
        text-decoration: none;
      }

      .task figure {
        position: relative;
        min-height: 30vh;
        padding: 0;
        margin: 0;
      }
      .task img {
        display: block;
        object-fit: cover;
        width: 100%;
        height: 100%;
        max-height: 40vh;
      }
      .task .placeholder {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .task main {
        padding: 1rem;
        background-color: var(--app-task-color);
      }
      /**
        * Persist animation using : animation-fill-mode set to forward 
        * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
        */
      .fade {
        -webkit-animation: fadeout 2s forwards; /* Safari and Chrome */
        -moz-animation: fadeout 2s forwards; /* Firefox */
        -ms-animation: fadeout 2s forwards; /* Internet Explorer */
        -o-animation: fadeout 2s forwards; /* Opera */
        animation: fadeout 2s forwards;
      }

      /* Key frame animation */
      @keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Firefox */
      @-moz-keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Safari and Chrome */
      @-webkit-keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      @media (min-width: 600px) {

      }

      /* Wide layout: when the viewport width is bigger than 460px, layout
      changes to a wide layout. */
      @media (min-width: 460px) {
        .task {
          flex-basis: 21%;
          margin: 2%;
        }
        .task figure {
          min-height: 20vh;
          height: 20vh;
          overflow: hidden;
        }
      }
    `;
  }

  static get properties() {
    return {
      id: { type: String },
      title: { type: String },
      description: { type: String },
    };
  }

  initTask(title, description, id = uniqid()) {
    this.title = title;
    this.description = description;
    this.id = id;
  }

  render() {
    return html`
      <article class="task">
      
        <header> <button class="btn-danger" @click=${this.delete}>X</button><figure>
          <h1>${this.title}</h1>
          <p>${this.description}</p>
        </main>
      </article>
    `;
  }

  delete(){
    var myHeaders = new Headers();

    var myInit = { method: 'DELETE',
      headers: myHeaders,
      mode: 'cors',
    };
    this.remove();

    const event = new CustomEvent("task-deleted", {
      detail: {
        task: this.id
      }
    });
    document.dispatchEvent(event);

    console.log('suppression id ',this.id)
    fetch(`http://localhost:3000/tasks/${this.id}`,myInit)
      .then(function(response) {
        return response.blob();
      });
  }
}

customElements.define('app-task', AppTask);