/**
    MIT License

    Copyright (c) 2020 Fuqua School of Business, Duke University

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */
import { html, css, LitElement } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'
import { classMap } from 'lit-html/directives/class-map';

import { FW_JOB_EDIT } from "./fw-jobs.js";  
import { FW_JOB_EDIT_CANCEL } from "./fw-jobs.js"; 
import { FW_JOB_EDIT_SAVE } from "./fw-jobs.js";
import { FW_JOB_DELETE } from "./fw-jobs.js";   


// listing of job postings in the admin view
export class FwAdminJobs extends LitElement {    

  static get properties() {
    return {
        jobs: { type: Array },
        skills: { type: Array },
        programs: { type: Array },
        sort: { type: String }
    };  
  }
  
 // sort the list of jobs
 //  this is pre-determined based on a project list number that has a specific
 //  format where the first character is an alphabetical character and the 
 //  remaining are numbers.  Sorts by the character first and then the number.
 //  This was completely arbitrary and implemented after the data was already
 //  formatted before the application was even specified.  The field is "id".
 jobSort(a,b) {
    
    let aChar = a.id.substring(0,1);
    let aNum = parseInt(a.id.substring(1));
    let bChar = b.id.substring(0,1);
    let bNum = parseInt(b.id.substring(1));
    
    if (aChar !== bChar) {
            if (Boolean(this.sort)) {
                return aChar > bChar ? 1: bChar > aChar ? -1: -0;
            } else {
                return bChar > aChar ? 1: aChar > bChar ? -1: -0;
            }        
    } else {
            if (Boolean(this.sort)) {
                return aNum > bNum ? 1: bNum > aNum ? -1: -0;
            } else {
                return bNum > aNum ? 1: aNum > bNum ? -1: -0;
            }        
    }
    
    this.sort = Boolean(this.sort) ? "false": "true";
  }
  
  constructor() {
    super();
    this.jobs = []; 
    this.skills = [];
    this.sort = "true";
  }  
  
  // render the list of job posting in the admin view
  render() {
    return html`
            ${this.jobs ? html`
                <ul _ngcontent-c2>
                    ${this.jobs.sort((a, b) => this.jobSort(a,b) ).map((item) => 
                        html`<li _ngcontent-c2><fw-admin-job _ngcontent-c2 .job=${item}></fw-admin-job></li>`)}
                </ul>
            `: html``}
    `;
  }

  createRenderRoot() {
	return this;
  }
  
}

// the admin view of a job posting for editing purposes
export class FwAdminJobEditor extends LitElement {

  static get properties() {
    return {
      job: { type: Object },
      skills: { type: Array }
    };
  }
  
  constructor() {
    super();
  }
  
  connectedCallback() {
      super.connectedCallback();
      this.startEditing();
  }
  
  // add or remove a job skill that applies to this job posting
  filterskills(item) {
        if (this.job.skills.indexOf(item) < 0) {
            this.job.skills.push (item);
        } else {
            this.job.skills.splice(this.job.skills.indexOf(item), 1);
        }
     this.requestUpdate();
  }
  
  // add or remove a program that applies to this job listing
  filterprograms(item) {
        if (this.job.programs.indexOf(item) < 0) {
            this.job.programs.push (item);
        } else {
            this.job.programs.splice(this.job.skills.indexOf(item), 1);
        }
     this.requestUpdate();
  }
  
  // HTML 5 Date fields in all browsers do not fully support ISO Dates
  parseDateBecauseStupid(d) {
      return d.substring(0, d.indexOf('T'));
  }
    
  async getMoreState(e) {
    return;
  }
  
  // emit an event to the DOM
  emitEvent(eventName, eventDetails) {
	let event = new CustomEvent( 
                eventName, { 'bubbles': true, 'composed': true, 'detail': eventDetails } );
        document.dispatchEvent(event);
  };
  
  // intialize the rich text editors when editing
  async startEditing() {
      await Promise.all([this.updateComplete, this.getMoreState()]);
      new FroalaEditor(".jobdetail,.jobapply", 
      {
        key: 'FROALA_LICENSE_KEY',
        attribution: false,
        toolbarSticky: true,
        height: 400,
        htmlAllowedTags: ['.*'],    
        imageUploadURL: '/rest/froala',
        fileUploadURL: '/rest/froala',
        videoUploadURL: '/rest/froala',
        fileMaxSize: 1024 * 1024 * 30,
        requestWithCORS: true,
        requestWithCredentials: true,
        toolbarButtons: 
        {
            moreText: {
                buttons: ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'],
                align: 'left',
                buttonsVisible: 3
            },
            moreParagraph: {
                buttons: ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent'],
                align: 'left',
                buttonsVisible: 3
            },
            moreRich: {
                buttons: ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'specialCharacters', 'insertFile', 'insertHR'],
                align: 'left',
                buttonsVisible: 3
            },
            moreMisc: {
                buttons: ['undo', 'redo', 'fullscreen', 'selectAll', 'html', 'help'],
                align: 'right',
                buttonsVisible: 2
            }
        },
        pluginsEnabled: ['align', 'charCounter', 'codeBeautifier', 'codeView', 'colors', 'draggable', 'embedly', 'emoticons', 'entities', 'file', 'fontAwesome', 'fontFamily', 'fontSize', 'fullscreen', 'image', 'imageTUI', 'imageManager', 'inlineStyle', 'inlineClass', 'lineBreaker', 'lineHeight', 'link', 'lists', 'paragraphFormat', 'paragraphStyle', 'quickInsert', 'quote', 'save', 'table', 'url', 'video', 'wordPaste', 'customPlugin' ]
      });
      
  }
  
  // event handler to save the current job being edited... the details and the apply
  // fields for a job posting are rich text where we are using the Froala Editor
  saveJob(e) {
    this.job.organization = document.getElementById("joborganization").value;
    this.job.url = document.getElementById("joburl").value;
    this.job.visible = document.getElementById("jobvisible").checked;
    this.job.id = document.getElementById("jobid").value;
    this.job.overview = document.getElementById("joboverview").value;
    this.job.priority_due = document.getElementById("priority_due").value;
    this.job.earliest_start = document.getElementById("earliest_start").value;
    this.job.latest_start = document.getElementById("latest_start").value;
    this.job.duration = document.getElementById("jobduration").value;
    this.job.details = document.getElementsByClassName("jobdetail")[0]['data-froala.editor'].html.get().replace(/<!---->/g, '');
    this.job.apply = document.getElementsByClassName("jobapply")[0]['data-froala.editor'].html.get().replace(/<!---->/g, '');
    this.emitEvent(FW_JOB_EDIT_SAVE, this.job);
  }
  
  // render the admin view for editing a job posting (this is not a dialog but a view)
  render(){
    return html`
                <section _editcontent>
                    <form _editcontent id="details" novalidate class="ng-untouched ng-pristine ng-valid">
                        <label _editcontent for="jobid">ID (internal use):</label>
                        <input _editcontent formcontrolname="jobid" id="jobid" required type="text" class="ng-untouched ng-pristine ng-valid" value="${this.job.id}">
                        <label _editcontent for="jobvisible">Project Visible:</label>
                        <input _editcontent formcontrolname="jobvisible" id="jobvisible" required type="checkbox" class="ng-untouched ng-pristine ng-valid" ?checked="${this.job.visible}"> Project visible?  
                        <label _editcontent for="organization">Organization:</label>
                        <input _editcontent formcontrolname="organization" id="joborganization" required type="text" style="width: 100%;" class="ng-untouched ng-pristine ng-valid" value="${this.job.organization}">   
                        <label _editcontent for="url">Organization URL:</label>
                        <input _editcontent formcontrolname="url" id="joburl" required type="url" style="width: 100%;" class="ng-untouched ng-pristine ng-valid" value="${this.job.url}">   
                        <label _editcontent for="joboverview">Overview:</label>
                        <input _editcontent formcontrolname="joboverview" id="joboverview" required type="text" style="width: 100%;" class="ng-untouched ng-pristine ng-valid" value="${this.job.overview}">   
                        <label _editcontent for="priority_due">Priority Due Date:</label>
                        <input _editcontent formcontrolname="priority_due" id="priority_due" required type="date" class="ng-untouched ng-pristine ng-valid" value="${this.job.priority_due}">
                        <label _editcontent for="earliest_start">Earliest Start Date:</label>
                        <input _editcontent formcontrolname="earliest_start" id="earliest_start" required type="date" class="ng-untouched ng-pristine ng-valid" value="${this.job.earliest_start}">
                        <label _editcontent for="latest_start">Latest Start Date:</label>
                        <input _editcontent formcontrolname="latest_start" id="latest_start" required type="date" class="ng-untouched ng-pristine ng-valid" value="${this.job.latest_start}">
                        <label _editcontent for="duration">Expected Duration:</label>
                        <input _editcontent formcontrolname="duration" id="jobduration" size="3" maxlength="3" min="0" max="52" required type="number" class="ng-untouched ng-pristine ng-valid" value="${this.job.duration}"> weeks
                        <label _editcontent for="jobdetail">Project Details:</label>
                        <div class="jobdetail">${unsafeHTML(this.job.details)}</div>
                        ${this.skills ? html`Required Skills: 
                             <nav _ngcontent-c3 style="margin-top: 10px;">
                                <div style="line-height: 2;">
                                    ${this.skills.sort().map((item) => html`<span _ngcontent-c3 @click=${(e) => { this.filterskills(item); }} class="tag ${this.job.skills.indexOf(item) > -1 ? 'active':''}">${item}</span>`)}
                                </div>
                            </nav>`: html``}
                        ${this.programs ? html`Program Alignment:
                            <nav _ngcontent-c3 style="margin-top: 10px; margin-bottom: 10px;">
                                <div style="line-height: 2;">
                                    ${this.programs.sort().map((item) => html`<span _ngcontent-c3 @click=${(e) => { this.filterprograms(item); }} class="tag ${this.job.programs.indexOf(item) > -1 ? 'active':''}">${item}</span>`)}
                                </div>
                            </nav>`: html``}
                        <label _editcontent for="jobapply">To Apply:</label>
                        <div class="jobapply">${unsafeHTML(this.job.apply)}</div>
                    </form>                  
                    <div _editcontent class="controls">
                        <button _editcontent type="button" @click=${(e) => this.emitEvent(FW_JOB_EDIT_CANCEL, {}) }>Cancel</button>
                        <button _editcontent type="button" @click=${this.saveJob}>Save</button>
                    </div>
                </section>
        `;
  }
  
  createRenderRoot() {
	return this;
  }
  
}

// render a specific job posting in the admin view of the job posting list
export class FwAdminJob extends LitElement {

  static get properties() {
    return {
      job: { type: Object }
    };
  }

  constructor() {
    super();
  }
  
  // emit an event to the DOM
  emitEvent(eventName, eventDetails) {
	let event = new CustomEvent( 
                eventName, { 'bubbles': true, 'composed': true, 'detail': eventDetails } );
        document.dispatchEvent(event);
  };
      
  // render a date string as desired
  dateString(d) {
    let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
    let date = new Date(d);
    return months[date.getUTCMonth()] + " " + date.getUTCDate();
  }
  
  render(){
    return html`
            <a _ngcontent-c2 class="linkButton" @click=${ (e) => this.emitEvent(FW_JOB_EDIT, this.job) }>
                <fa-icon _ngcontent-c2 class="ng-fa-icon">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="edit" class="svg-inline--fa fa-edit fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path fill="currentColor" d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"></path>
                    </svg>
                </fa-icon> Edit 
            </a>
            ${this.job.id ? html`<span _ngcontent-c2>${this.job.id}</span> `: html``}
            ${Boolean(this.job.visible) ? html``: html`<span style="color: red;">Not Visible</span> `}
            <span _ngcontent-c2>${this.dateString(this.job.earliest_start)}</span>
            <span _ngcontent-c2>${this.job.organization}${this.job.overview ? html`<br />${this.job.overview}`: html``}</span>     
            <button _ngcontent-c2 aria-label="Delete Item" type="button" @click=${ (e) => this.emitEvent(FW_JOB_DELETE, this.job)}>
                <fa-icon _ngcontent-c2 class="ng-fa-icon">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash-alt" class="svg-inline--fa fa-trash-alt fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor" d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path>
                    </svg>
                </fa-icon> Delete 
            </button>
        `;
  }
  
  createRenderRoot() {
	return this;
  }
}
if (!customElements.get('fw-admin-jobs')) customElements.define('fw-admin-jobs', FwAdminJobs);
if (!customElements.get('fw-admin-job-editor')) customElements.define('fw-admin-job-editor', FwAdminJobEditor);
if (!customElements.get('fw-admin-job')) customElements.define('fw-admin-job', FwAdminJob);