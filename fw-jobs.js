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

import { FwJobList } from './fw-job-list.js';
import { FwAdminJobs, FwAdminJobEditor } from './fw-admin-jobs.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js'

export const FW_JOB_EDIT = "_FW_JOB_EDIT";      
export const FW_JOB_EDIT_CANCEL = "_FW_JOB_EDIT_CANCEL";
export const FW_JOB_EDIT_SAVE = "_FW_JOB_EDIT_SAVE";
export const FW_JOB_DELETE = "_FW_JOB_DELETE";

export class FwJobs extends LitElement {    
  
  static get properties() {
    return {
        mode: { type: String },
        list: { type: Object },
        listdraft: { type: Object },
        items: { type: Array },
        job: { type: Object },
        users: { type: Array },
        role: { type: String }
    };  
  }
  
  connectedCallback() {
      super.connectedCallback();
      document.addEventListener(FW_JOB_EDIT, this.handleEditEvent);
      document.addEventListener(FW_JOB_DELETE, this.handleDeleteEvent);
      document.addEventListener(FW_JOB_EDIT_CANCEL, this.handleCancelEvent);
      document.addEventListener(FW_JOB_EDIT_SAVE, this.handleSaveEvent);
      this.fetchList();
  }
  
  getNextId() {
     let n = 0;
     this.items.forEach((job) => {
         let aNum = parseInt(job.id.substring(1));
         if (aNum > n) n = aNum;
     });
     return 'F' + (n + 1);
  }
 
  disconnectedCallback() { 
    document.removeEventListener(FW_JOB_EDIT, this.handleEditEvent);
    document.removeEventListener(FW_JOB_DELETE, this.handleDeleteEvent); 
    document.removeEventListener(FW_JOB_EDIT_CANCEL, this.handleCancelEvent);
    document.removeEventListener(FW_JOB_EDIT_SAVE, this.handleSaveEvent);
    super.disconnectedCallback();
  }
  
  async getJobListingsFromService() {
    const response = await fetch(`https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/configuration`);
    const json = await response.json();
    if (json) {
       this.list = json;
       this.getJobs();
    } 
  }
  
  // Get all of the job postings.
  async getJobs() {
    const url = `https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings`;
    const response = await fetch(url);            
    const json = await response.json();
    if (json) {
        this.items = json;
    }
  }
  
  fetchList() {
      this.getJobListingsFromService();
  }
  
  async getMoreState(e) {
    return;
  }
  
  async startEditing(e) {
      this.listdraft = Object.assign({}, this.list);
      this.listdraft.skills = Object.assign([], this.list.skills);
      this.listdraft.programs = Object.assign([], this.list.programs);
      this.mode = 'edit';
      await Promise.all([this.updateComplete, this.getMoreState()]);
      new FroalaEditor(".intro-preview", 
      {
        key: 'FROALA_LICENSE_KEY',
        attribution: false,
        toolbarSticky: true,
        htmlAllowedTags: ['.*'],    
        imageUploadURL: '/rest/fuquaworld/froala',
        fileUploadURL: '/rest/fuquaworld/froala',
        videoUploadURL: '/rest/fuquaworld/froala',
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
  
  constructor() {
    super();
    this.list = {};
    this.items = [];
    this.mode = "user"; 
    this.job = {};
    this.role = "user";
    this.users = [];
    this.handleEditEvent = this.handleEditEvent.bind(this);
    this.handleDeleteEvent = this.handleDeleteEvent.bind(this);
    this.handleCancelEvent = this.handleCancelEvent.bind(this);
    this.handleSaveEvent = this.handleSaveEvent.bind(this);
  }
  
  handleEditEvent(e) {
      console.log(e);
      this.job = e.detail;
  }
  
  handleCancelEvent(e) {
      console.log(e);
      this.job = {};
  }
  
  async handleSaveEvent(e) {
        console.log(e);
    	let payload = Object.assign({}, this.job);
        if (payload.new) delete payload.new;
    	payload.modified = new Date().toISOString();
	try {
            const response = await fetch(`https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings`, {
      		method: 'post',
      		mode: 'cors',
      		cache: 'no-cache',
      		body: JSON.stringify(payload),
      		credentials: 'include',
      		headers: {
                    'Content-Type': 'application/json'
      		}
            });
            if (response.status >= 200 && response.status < 300) {
                // Successful save, go ahead and retrieve list of jobs again
                this.items.push(payload);
                this.job = {};
                this.getJobs();
            } else {
		alert("There was an error trying to save your changes. Error code: " + response.status);
            }
        } catch (e) {
            alert("There was an error trying to save your changes. The message was " + e);
        }
  }
  
  // POST TO SERVICE
  async saveJobListToService() {
	if (confirm("Are you ready to save your changes?")) {
                // Clone the data to save
    		let payload = Object.assign({}, this.listdraft);
                // Get the edited list_intro HTML [in this case from a Froala Editor]
                payload.list_intro = document.getElementsByClassName("intro-preview")[0]['data-froala.editor'].html.get().replace(/<!---->/g, '');
    		payload.modified = new Date().toISOString();
		try {
                        // Post list to the job postings save endpoint 
                        //    This saves the meta data about the job postings app instance.  You can think of it as 
                        //    the current instance whereas you might archive each year... or create multiple job posting
                        //    lists.  Our purpose was intended for archiving a given time period... but the use case was
                        //    not really established.   This data has the introduction text, the list of skills and the 
                        //    list of programs and other configuration data which you can see in the reference documentation
                        //    for the project in GitHub.
                        //
                        //    In this demo instance, it is the same URL as the Job Postings update end point
                        //    because in CouchDB, the variable data is in the document and we don't need two
                        //    different end points.
    			const response = await fetch(`https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings`, {
      				method: 'post',
      				mode: 'cors',
      				cache: 'no-cache',
      				body: JSON.stringify(payload),
      				credentials: 'include',
      				headers: {
					'Content-Type': 'application/json'
      				}
    			});
			if (response.status >= 200 && response.status < 300) {
                                // Successful save, go ahead and retrieve configuration again and
                                // remain in "admin" view.
				this.fetchList();
                                this.mode="admin";
			} else {
				alert("There was an error trying to save your changes. Error code: " + response.status);
			}
		} catch (e) {
			// Network or client related errors
                	alert("There was an error trying to save your changes. The message was " + e);
		}
	} 
  }
  
  async handleDeleteEvent(e) {
      if (confirm("Are you sure you want to delete this job listing?")) {
        console.log(e);
    	let payload = Object.assign({}, e.detail);
	try {
            // Delete the specific job posting 
            const response = await fetch(`https://go.fuqua.duke.edu/fuqua_link/rest/jobs/demo/postings`, {
      		method: 'delete',
      		mode: 'cors',
      		cache: 'no-cache',
      		body: JSON.stringify(payload),
      		credentials: 'include',
      		headers: {
                    'Content-Type': 'application/json'
      		}
            });
            if (response.status >= 200 && response.status < 300) {
                this.getJobs();
            } else {
		alert("There was an error trying to delete this job. Error code: " + response.status);
            }
        } catch (e) {
            alert("There was an error trying to delete this job. The message was " + e);
        }  
    }
  }
  
  addSkill(skill) {
      if (skill.length > 0) {
      if (this.listdraft.skills.indexOf(skill) < 0) {
          this.listdraft.skills.push(skill);
      } 
      this.requestUpdate();
    }
  }
  
  addProgram(program) {
      if (program.length > 0) {
      if (this.listdraft.programs.indexOf(program) < 0) {
          this.listdraft.programs.push(program);
      } 
      this.requestUpdate();
    }
  }
  
  createJob(e) {
        console.log(e);
	let event = new CustomEvent( 
                FW_JOB_EDIT, { 'bubbles': true, 'composed': true, 'detail': { new: true, visible: true, organization: 'New Posting', url: '', id: this.getNextId(), overview: '',  priority_due: '', latest_start: '', earliest_start: '', duration: 1, details: '', skills: [], programs: [], apply: '' }   } );
        document.dispatchEvent(event);      
  }
  
  // render the application component
  render() {

	return  html`
            ${this.mode == "edit" ? html`

                            <section _editcontent style="margin-top: 20px;">
                                    <div _editcontent class="intro-preview">${unsafeHTML(this.listdraft.list_intro)}</div>
                                    <h3 _editcontent>Skills:</h3>
                                        <div style="line-height: 2;">
                                            ${this.listdraft.skills.sort().map((item) => html`
                                                <span _editcontentli>
                                                    <span _editcontent>${item}</span>
                                                    <button @click=${(e) => { this.listdraft.skills.splice(this.listdraft.skills.indexOf(item),1); this.requestUpdate(); } } _editcontent aria-label="Remove Tag" type="button" title="Remove '${item}'">
                                                        <fa-icon _editcontent class="ng-fa-icon" size="lg">
                                                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="window-close" class="svg-inline--fa fa-window-close fa-w-16 fa-lg" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                                <path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-83.6 290.5c4.8 4.8 4.8 12.6 0 17.4l-40.5 40.5c-4.8 4.8-12.6 4.8-17.4 0L256 313.3l-66.5 67.1c-4.8 4.8-12.6 4.8-17.4 0l-40.5-40.5c-4.8-4.8-4.8-12.6 0-17.4l67.1-66.5-67.1-66.5c-4.8-4.8-4.8-12.6 0-17.4l40.5-40.5c4.8-4.8 12.6-4.8 17.4 0l66.5 67.1 66.5-67.1c4.8-4.8 12.6-4.8 17.4 0l40.5 40.5c4.8 4.8 4.8 12.6 0 17.4L313.3 256l67.1 66.5z"></path>
                                                            </svg>
                                                        </fa-icon>
                                                    </button>
                                                </span>`)}
                                        </div>
                                        <input _editcontent name="addskill" id="addskill" type="text" class="ng-untouched ng-pristine ng-invalid">
                                        <button @click=${ (e) => this.addSkill(document.getElementById("addskill").value) } _editcontent >Add Skill</button>
                                        <div style="line-height: 2;">
                                            ${this.listdraft.programs.sort().map((item) => html`
                                                <span _editcontentli>
                                                    <span _editcontent>${item}</span>
                                                    <button @click=${(e) => { this.listdraft.programs.splice(this.listdraft.programs.indexOf(item),1); this.requestUpdate(); } } _editcontent aria-label="Remove Tag" type="button" title="Remove '${item}'">
                                                        <fa-icon _editcontent class="ng-fa-icon" size="lg">
                                                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="window-close" class="svg-inline--fa fa-window-close fa-w-16 fa-lg" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                                <path fill="currentColor" d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-83.6 290.5c4.8 4.8 4.8 12.6 0 17.4l-40.5 40.5c-4.8 4.8-12.6 4.8-17.4 0L256 313.3l-66.5 67.1c-4.8 4.8-12.6 4.8-17.4 0l-40.5-40.5c-4.8-4.8-4.8-12.6 0-17.4l67.1-66.5-67.1-66.5c-4.8-4.8-4.8-12.6 0-17.4l40.5-40.5c4.8-4.8 12.6-4.8 17.4 0l66.5 67.1 66.5-67.1c4.8-4.8 12.6-4.8 17.4 0l40.5 40.5c4.8 4.8 4.8 12.6 0 17.4L313.3 256l67.1 66.5z"></path>
                                                            </svg>
                                                        </fa-icon>
                                                    </button>
                                                </span>`)}
                                        </div>
                                        <input _editcontent name="addprogram" id="addprogram" type="text" class="ng-untouched ng-pristine ng-invalid">
                                        <button @click=${ (e) => this.addProgram(document.getElementById("addprogram").value) } _editcontent >Add Program</button>
                                        
                                    <div _editcontent class="controls" style="margin-top: 20px;">
                                        <button @click=${(e) => this.mode = "admin" } _editcontent type="button">Cancel</button>
                                        <button _editcontent @click=${(e) => this.saveJobListToService() } type="button">Save</button>
                                    </div>
                            </section>
                         
            `: html`
                ${this.mode == "admin" ? html`
                    ${this.job && this.job.organization ? html`<fw-admin-job-editor .job=${this.job} .programs=${this.list.programs} .skills=${this.list.skills}></fw-admin-job-editor>`: html`
                        <main _nghost-c2>
                            <section _ngcontent-c2>
                            <a _ngcontent-c2="" class="linkButton" @click=${ (e) => this.mode = 'user' }>Preview List</a>
                            <header _ngcontent-c2>
                                <div>${unsafeHTML(this.list.list_intro)}</div>
                                <div _ngcontent-c2 class="controls">
                                    <button @click=${this.startEditing} _ngcontent-c2 type="button">Edit Intro Text, Skills and Programs</button>
                                </div>
                                </header>
                                <a @click=${this.createJob} _ngcontent-c2 class="linkButton">Add Job Posting</a>
                                <fw-admin-jobs .jobs=${this.items} .skills=${this.list.skills}></fw-admin-jobs>
                            </section>
                        </main>
                    `}
                `: html`
                <main _ngcontent-c3> 
                    ${this.role == "admin" ? html`<a _ngcontent-c3 @click=${ (e) => { this.mode = 'admin'; } }>← Exit Preview</a>`: html``}
                    ${this.list.list_intro ? html`<header _ngcontent-c3 class="introeditor">
                        ${unsafeHTML(this.list.list_intro)}
                    </header>
                    <fw-job-list .jobs=${this.items} .field_selectors=${this.list.field_selectors} .programs=${this.list.programs} .skills=${this.list.skills}></fw-job-list>
                    `:html``}
                </main>`}
            `}
`;

  }

  createRenderRoot() {
	return this;
  }
  
}
if (!customElements.get('fw-jobs')) customElements.define('fw-jobs', FwJobs);

