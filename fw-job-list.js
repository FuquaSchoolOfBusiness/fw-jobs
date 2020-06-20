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
import '@material/mwc-dialog'

export class FwJobList extends LitElement {    

  static get properties() {
    return {
        jobs: { type: Array },
        skills: { type: Array },
        field_selectors: { type: Array },
        programs: { type: Array },
        skillfilters: { type: Array },
        programfilters: { type: Array },
        timefilters: { type: Array },
        selected_fields: { type: Array },
        selected_columns: { type: Array },
        startdatefilter: { type: String },
        durationfilter: { type: String },
        sortstate: { type: Object },
        expandedall: {type: String }
    };  
  }
  
  connectedCallback() {
      super.connectedCallback();
  }
  
  constructor() {
    super();
    this.jobs = []; 
    this.skills = [];
    this.programs = [];
    this.skillfilters = [];
    this.programfilters = [];
    this.timefilters = [];
    this.expandedall = "false";
    this.selected_fields = [];
    this.selected_columns = [];
    this.sortstate= { "field": "priority_due", "sort": false };     // the default sort
    this.showForm = this.showForm.bind(this);
    this.addTimeBasedFilter = this.addTimeBasedFilter.bind(this);
    this.changeTimeBasedFilterField = this.changeTimeBasedFilterField.bind(this); 
    this.expandAllJobs = this.expandAllJobs.bind(this);
  }
  
  // change the sort field or order of the sort
  changesort(field) {
      if (this.sortstate.field === field) {
          this.sortstate.sort = !this.sortstate.sort;
      } else {
          this.sortstate.field = field;
          this.sortstate.sort = true;
      }
      this.requestUpdate();
  }
  
  // sort by organization
  organizationSort(a, b, force) {
      if (Boolean(this.sortstate.sort) || force) {
        return a.organization > b.organization ? 1: b.organization > a.organization ? -1: 0;
      } else {
        return b.organization > a.organization ? 1: a.organization > b.organization ? -1: 0;
      }
  }
  
  // sort by time fields
  timeSort(a,b) {
        if (this.sortstate.field === 'earliest_start') {
          if (b.earliest_start.length < 1 && a.earliest_start.length < 1) {
              return this.organizationSort(a, b, true);
          } else if (b.earliest_start.length < 1 && a.earliest_start.length > 0) {
              return -1;
          } else if (b.earliest_start.length > 0 && a.earliest_start.length < 1) {
              return 1;
          }            
          let bdiff = new Date(b.earliest_start).getTime() - new Date(a.earliest_start).getTime();
          let adiff = new Date(a.earliest_start).getTime() - new Date(b.earliest_start).getTime();
          if (Boolean(this.sortstate.sort)) {
              return adiff == 0 ? this.organizationSort(a,b, true): adiff;
          } else {
              return bdiff == 0 ? this.organizationSort(a,b, true): bdiff;
          }
        } else if (this.sortstate.field === 'latest_start') {
          if (b.latest_start.length < 1 && a.latest_start.length < 1) {
              return this.organizationSort(a, b, true);
          } else if (b.latest_start.length < 1 && a.latest_start.length > 0) {
              return -1;
          } else if (b.latest_start.length > 0 && a.latest_start.length < 1) {
              return 1;
          }            
          let bdiff = new Date(b.latest_start).getTime() - new Date(a.latest_start).getTime();
          let adiff = new Date(a.latest_start).getTime() - new Date(b.latest_start).getTime();
          if (Boolean(this.sortstate.sort)) {
              return adiff == 0 ? this.organizationSort(a,b, true): adiff;
          } else {
              return bdiff == 0 ? this.organizationSort(a,b, true): bdiff;
          }
        } else if (this.sortstate.field === 'priority_due') {
          if (b.priority_due.length < 1 && a.priority_due.length < 1) {
            return this.organizationSort(a, b, true);
          } else if (b.priority_due.length < 1 && a.priority_due.length > 0) {
              return -1;
          } else if (b.priority_due.length > 0 && a.priority_due.length < 1) {
              return 1;
          }
          let bdiff = new Date(b.priority_due).getTime() - new Date(a.priority_due).getTime();
          let adiff = new Date(a.priority_due).getTime() - new Date(b.priority_due).getTime();
          if (Boolean(this.sortstate.sort)) {
              return adiff == 0 ? this.organizationSort(a,b, true): adiff;
          } else {
              return bdiff == 0 ? this.organizationSort(a,b, true): bdiff;
          }          
        } else if (this.sortstate.field === 'duration') {
            if (Boolean(this.sortstate.sort)) {
                return parseInt(a.duration) > parseInt(b.duration) ? 1 : parseInt(b.duration) > parseInt(a.duration) ? -1: this.organizationSort(a, b, true);
            } else {
                return parseInt(b.duration) > parseInt(a.duration) ? 1 : parseInt(a.duration) > parseInt(b.duration) ? -1: this.organizationSort(a, b, true);
            }
        } else if (this.sortstate.field === 'organization') {
            return this.organizationSort(a, b, false);
        }   
  }
  
  // Determine what sort icons should show on the column
  sorticon(field) {
      if (this.sortstate.field === field) {
          if (Boolean(this.sortstate.sort)) {
              return "fa-sort-up";
          } else {
              return "fa-sort-down";
          }
      } else {
          return 'fa-sort';
      }
  }
  
  // Add or remove skill from list of skills selected for filtering
  filterskills(item) {
        if (this.skillfilters.indexOf(item) < 0) {
            this.skillfilters.push (item);
        } else {
            this.skillfilters.splice(this.skillfilters.indexOf(item), 1);
        }
        this.requestUpdate();
  }
  
  // Add or remove field to show from list of fields allowed to hide
  filterfields(item) {
        if (item === 'Expected Duration' || item === 'Priority Due Date' || item === 'Earliest Start Date' || item === 'Latest Start Date') {
            if (this.selected_columns.indexOf(item) < 0) {
                this.selected_columns = [...this.selected_columns, item];
            } else {
                this.selected_columns.splice(this.selected_columns.indexOf(item), 1);
                this.selected_columns = [...this.selected_columns];
            }            
        }
        if (this.selected_fields.indexOf(item) < 0) {
            this.selected_fields = [...this.selected_fields, item];
        } else {
            this.selected_fields.splice(this.selected_fields.indexOf(item), 1);
            this.selected_fields = [...this.selected_fields];
        }
  }
  
  // Add or remove program from list of programs selected for filtering
  filterprograms(item) {
        if (this.programfilters.indexOf(item) < 0) {
            this.programfilters.push (item);
        } else {
            this.programfilters.splice(this.programfilters.indexOf(item), 1);
        }
        this.requestUpdate();
  }
  
  // filter for time filter
  isTimeFiltered(item, filter) {
      if (filter.value instanceof Date) {
          if (filter.criteria === ">") {
              return new Date(item[filter.field]).getTime() > filter.value.getTime();
          } else if (filter.criteria === "<") {
              return new Date(item[filter.field]).getTime() < filter.value.getTime();
          } else {
              return new Date(item[filter.field]).getTime() === filter.value.getTime();
          }          
      } else {
          if (filter.criteria === ">") {
              return parseInt(item.duration) > parseInt(filter.value);
          } else if (filter.criteria === "<") {
              return parseInt(item.duration) < parseInt(filter.value);
          } else {
              return parseInt(item.duration) === parseInt(filter.value);
          }
      }
  }
  
  // apply time filters
  filterUsingTimeFilters(item) {
    let ret_value = false;
    if (this.timefilters.length > 0) {
        this.timefilters.forEach((f) => { 
            if (this.isTimeFiltered(item,f)) { ret_value = true; } } 
        );
    } else {
        ret_value = true;
    }
    return ret_value;
  }
  
  // get the ISO date of a string because well ISO date formats are still
  // a bit kludgy (actually we are stripping the ISO ending.. because we are
  // relying on the HTML5 date field.  
  getISODate(datestring) {
      return datestring.substring(0, datestring.indexOf("T"));
  }
  
  // filter based on selected tags/skills
  hasTag(tagfilters, list) {
     let response = false;
     if (list.length > 0) {
        for (var i=0; i < tagfilters.length;i++) {
            if (list.indexOf(tagfilters[i]) > -1) response = true;
        }
    } else {
        if (tagfilters.indexOf("No Skills Required") > -1) response = true;     
    }
    return response;
  }
  
  // open a dialog 
  showForm(e) {
	this.querySelector('mwc-dialog').open = true;
  }
  
  // Handler for dialog when adding a time filter switching between date-based
  // or duration based filter type.
  changeTimeBasedFilterField(e) {
    console.log(e);
    let field = document.getElementById("time_based_filter_field").value;
    if (field === 'Duration') {
        document.getElementById('time_based_filter_number').style.display = "inline";
        document.getElementById('time_based_filter_date').style.display = "none";
    } else {
        document.getElementById('time_based_filter_number').style.display = "none";
        document.getElementById('time_based_filter_date').style.display = "inline";
    } 
  }
  
  // remove time filter from list of time filters applied to job listings
  removeTimeFilter(item) {
        if (this.timefilters.indexOf(item) > -1) {
            this.timefilters.splice(this.timefilters.indexOf(item), 1);
        }
        this.requestUpdate();      
  }
  
  // expand all job listings or restore to previous state
  expandAllJobs(e) {
      if (this.expandedall === "false") {
          this.expandedall = "true";
      } else {
          this.expandedall = "false";
      }
  };
  
  // add time filter to list of time filters to apply to job listings
  // time filters are either date based or duration based
  addTimeBasedFilter(e) {
      let field = document.getElementById("time_based_filter_field").value;
      let criteria = document.getElementById("time_based_filter_criteria").value;
      let d = document.getElementById("time_based_filter_date").value;
      let n = document.getElementById("time_based_filter_number").value;
      let filter = {};
      filter.name = field;
      if (field === 'Duration') {
          filter.field = 'duration';
      } else if (field === 'Priority Due Date') {
          filter.field = 'priority_due';
      } else if (field === 'Earliest Start Date') {
          filter.field = 'earliest_start';
      } else if (field === 'Latest Start Date') {
          filter.field = 'latest_start';
      }
      filter.criteria = criteria;
      if (field === 'Duration') {
          filter.value = n;
          filter.valueDisplay = n + " weeks";
      } else {
          filter.value = new Date(d);
          filter.valueDisplay = d;
      }
      this.timefilters = [...this.timefilters, filter];
      console.log(JSON.stringify(filter));
      this.querySelector('mwc-dialog').close();
      this.requestUpdate();
  }
  
  // render the list of jobs with sorting and filtering options and the dialog
  render() {
    return html`
         ${this.programs ? html`<span class="md-tooltip--right" data-md-tooltip="Any qualified student is encouraged to apply.">Program Alignment Filter:</span>
        <nav _ngcontent-c3 style="margin-top: 10px; margin-bottom: 10px;">
            <div style="line-height: 2;">
                ${this.programs.sort().map((item) => html`<span _ngcontent-c3 @click=${(e) => { this.filterprograms(item); }} class="tag ${this.programfilters.indexOf(item) > -1 ? 'active':''}">${item}</span>`)}
            </div>
        </nav>`: html``}
        ${this.skills ? html`Required Skills Filter: 
        <nav _ngcontent-c3 style="margin-top: 10px; margin-bottom: 10px;">
            <div style="line-height: 2;">
                <span _ngcontent-c3 @click=${(e) => { this.filterskills("No Skills Required"); }} class="tag ${this.skillfilters.indexOf("No Skills Required") > -1 ? 'active':''}">None Specified</span>
                ${this.skills.sort().map((item) => html`<span _ngcontent-c3 @click=${(e) => { this.filterskills(item); }} class="tag ${this.skillfilters.indexOf(item) > -1 ? 'active':''}">${item}</span>`)}
            </div>
        </nav>`: html``}
        Time Based Filters: 
        <nav _ngcontent-c3 style="margin-top: 10px; margin-bottom: 10px;">
            <div style="line-height: 2;">
                <span _ngcontent-c3 style="margin-right: 10px;">
                    <button @click=${this.showForm} _ngcontent-c2 aria-label="Add Filter" type="button">Add Filter</button>
                </span>
                ${this.timefilters.map((item) => html`     
                        <span @click=${(e) => { this.removeTimeFilter(item); }} _ngcontent-c3 class="tag active">${item.name} ${item.criteria} ${item.valueDisplay}</span>
                `)}
            </div>
        </nav>
        <style>
                .timefilter {
                    background-color: var(--fuqua-blue);
                    border-radius: .25rem;
                    color: #fff;
                    margin-right: .5rem;
                }
        </style>
        ${this.skills ? html`Selected Fields to Hide: 
        <nav _ngcontent-c3 style="margin-top: 10px;">
            <div style="line-height: 2;">
                ${this.field_selectors.sort().map((item) => html`<span _ngcontent-c3 @click=${(e) => { this.filterfields(item); }} class="tag ${this.selected_fields.indexOf(item) > -1 ? 'active':''}">${item}</span>`)}
            </div>
        </nav>`: html``}
        ${this.jobs ? html`
        <section _ngcontent-c3>
            <header _ngcontent-c3 class="list-header">
                <h3 _ngcontent-c3 class="${this.selected_columns ? 'itemlen' + this.selected_columns.length: 'itemlen0'}">Organization<i @click="${(e) => this.changesort('organization') }" class="fa ${this.sorticon('organization')}"></i></h3>
                ${this.selected_columns.indexOf("Priority Due Date") < 0 ? html`<h3 _ngcontent-c3 data-md-tooltip="Application deadline for visa-related priority consideration." class="md-tooltip--left ${this.selected_columns ? 'itemlen' + this.selected_columns.length: 'itemlen0'}">Priority Due <i @click="${(e) => this.changesort('priority_due') }" class="fa ${this.sorticon('priority_due')}"></i></h3>`: html``} 
                ${this.selected_columns.indexOf("Earliest Start Date") < 0 ? html`<h3 _ngcontent-c3 data-md-tooltip="Earliest date on which work can begin." class="md-tooltip--left ${this.selected_columns ? 'itemlen' + this.selected_columns.length: 'itemlen0'}">Earliest Start <i @click="${(e) => this.changesort('earliest_start') }" class="fa ${this.sorticon('earliest_start')}"></i></h3>`: html``} 
                ${this.selected_columns.indexOf("Latest Start Date") < 0 ? html`<h3 _ngcontent-c3 data-md-tooltip="Latest date on which work can begin." class="md-tooltip--left ${this.selected_columns ? 'itemlen' + this.selected_columns.length: 'itemlen0'}">Latest Start <i @click="${(e) => this.changesort('latest_start') }" class="fa ${this.sorticon('latest_start')}"></i></h3>`: html``} 
                ${this.selected_columns.indexOf("Expected Duration") < 0 ? html`<h3 _ngcontent-c3 data-md-tooltip="Estimated project length." class="md-tooltip--left ${this.selected_columns ? 'itemlen' + this.selected_columns.length: 'itemlen0'}">Duration <i @click="${(e) => this.changesort('duration') }" class="fa ${this.sorticon('duration')}"></i></h3>`: html``} 
                <h3 _ngcontent-c3 @click=${this.expandAllJobs}>${this.expandedall === "false" ? html`+`: html`-`}</h3>
            </header>
            <ul _ngcontent-c3>
                ${this.jobs
                        .filter((item) => this.programfilters.length < 1 || this.hasTag(this.programfilters, item.programs) )
                        .filter((item) => this.skillfilters.length < 1 || this.hasTag(this.skillfilters, item.skills) )
                        .filter((item) => this.filterUsingTimeFilters(item)).sort((a, b) => this.timeSort(a,b) ).map((item) => 
                    html`${Boolean(item.visible) ? html`<li _ngcontent-c3><fw-job .selected_columns=${this.selected_columns} .selected_fields=${this.selected_fields} .job=${item} .expandedall=${this.expandedall}></fw-job></li>`: html``}`)}
            </ul>
        </section>
        <style>
                .styled {
                    --mdc-dialog-min-width: 420px;
                    --mdc-text-field-min-width: 420px;
                }
                .small_button {
                    --mdc-button-horizontal-padding: 5px;
                }
                button[_time_dialog] {
                    background-color: var(--fuqua-blue);
                    border: none;
                    border-radius: .5em;
                    color: #fff;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: .25rem;
                }
            </style>
            <mwc-dialog class="styled" heading="Add Time Based Filter" id="add_filter_dialog">
                    <div>
                        <select @change=${this.changeTimeBasedFilterField} id="time_based_filter_field">
                            <option>Priority Due Date</option>
                            <option>Earliest Start Date</option>
                            <option>Duration</option>
                        </select>
                    </div>
                    <div>
                        <select id="time_based_filter_criteria">
                            <option value=">">Greater Than</option>
                            <option value="<">Less Than</option>
                            <option value="=">Equals</option>
                        </select>
                    </div>
                    <div>
                        <input style="display: none;" id="time_based_filter_number" type="number" max="60" min="1" size="3" value="1" />
                        <input id="time_based_filter_date" type="date" value="${this.getISODate(new Date().toISOString())}" />
                    </div>

                <button _time_dialog style="background-color: #676767;" slot=secondaryAction dialogAction=no type="button">Cancel</button>
                <button _time_dialog slot=primaryAction type="button" @click=${this.addTimeBasedFilter}>Add Filter</button> 
            </mwc-dialog>
        `: html``}
    `;
    }
    
    createRenderRoot() {
	return this;
    }
    
}

// Represents a specific job posting
export class FwJob extends LitElement {
    
  static get properties() {
    return {
      job: { type: Object },
      selected_fields: { type: Array },
      selected_columns: { type: Array },
      expanded: { type: String },
      expandedall: { type: String }
    };
  }

  constructor() {
    super();
    this.expandedall = "false";
  }
  
  // expand or contract this job listing
  expand(e) {
      if (this.expanded == "true") 
      { 
          this.expanded = "false";
      } else { 
          this.expanded = "true"; 
      }
  }
       
  // convert the date to a desired string format
  dateString(d) {
    if (d == null || d.length < 1) {
        return null;
    } else {
        let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
        let date = new Date(d);
        return months[date.getUTCMonth()] + " " + date.getUTCDate();
    }
  }
  
  // is the date before now (is the job posting expired)
  isExpired(t) {
    let n = new Date();
    let d = new Date(t);
    return n.getTime() > d.getTime(); 
  }
  
  // render the specific job posting in the list
  render(){
    return html`
            <article @click=${this.expand} _ngcontent-c4 class="todo-info ${this.expanded == "true" || this.expandedall == "true" ? 'expanded':''}">
                <h4 _ngcontent-c4 class="${this.selected_columns ? 'itemlen' + this.selected_columns.length: 'itemlen0'}">
                    ${this.selected_fields.indexOf("Organization") < 0 ? 
                        html`
                            ${this.job.url ? html`<a target="_blank" href="${this.job.url}">${this.job.organization}</a>`: html`${this.job.organization}`}`: 
                        html``
                    }
                    ${this.job.overview && this.selected_fields.indexOf("Overview") < 0 ? html`<br />${this.job.overview}`: html``}
                    ${this.job.skills && this.selected_fields.indexOf("Skills") < 0 ? html`<br />${this.job.skills.sort().map((item) => html`<span style="font-size: 1rem;" class="tag">${item}</span>`)}`: html``}
                </h4>
                ${this.selected_fields.indexOf("Priority Due Date") < 0 ? html`<h5 _ngcontent-c4 class="${this.selected_columns && (this.expanded == "false" || this.expandedall == "false") ? 'itemlen' + this.selected_columns.length: ''}"> 
                    ${this.expanded == "true" || this.expandedall == "true" ? html``: html`<time>${this.dateString(this.job.priority_due)}</time>`}
                </h5>`: html``}
                ${this.selected_fields.indexOf("Earliest Start Date") < 0 ? html`<h5 _ngcontent-c4 class="${this.selected_columns && (this.expanded == "false" || this.expandedall == "false") ? 'itemlen' + this.selected_columns.length: ''}">
                    ${this.expanded == "true" || this.expandedall == "true" ? html``: html`<time>${this.dateString(this.job.earliest_start)}</time>`}
                </h5>`: html``}
                ${this.selected_fields.indexOf("Latest Start Date") < 0 ? html`<h5 _ngcontent-c4 class="${this.selected_columns && (this.expanded == "false" || this.expandedall == "false") ? 'itemlen' + this.selected_columns.length: ''}">
                    ${this.expanded == "true" || this.expandedall == "true" ? html``: html`<time>${this.dateString(this.job.latest_start)}</time>`}
                </h5>`: html``}
                ${this.selected_fields.indexOf("Expected Duration") < 0 ? html`
                    <h5 _ngcontent-c4 class="${this.selected_columns && (this.expanded == "false" || this.expandedall == "false") ? 'itemlen' + this.selected_columns.length: ''}">
                    ${this.job.duration && this.expanded != "true" && this.expandedall != "true" ? html`${this.job.duration} weeks`: html``}
                    ${this.job.priority_due.length > 0 && (this.expanded == "true" || this.expandedall == "true") ? html`<span class="md-tooltip--left" data-md-tooltip="Application deadline for visa-related priority consideration.">Priority Due Date: <time>${this.dateString(this.job.priority_due)}</time></span>`: html``} 
                    ${this.job.earliest_start.length > 0 && (this.expanded == "true" || this.expandedall == "true")? html`<span class="md-tooltip--left" data-md-tooltip="Earliest date on which work can begin.">Earliest Start Date: <time>${this.dateString(this.job.earliest_start)}</time></span>`: html``} 
                    ${this.job.latest_start.length > 0 && (this.expanded == "true" || this.expandedall == "true")? html`<span class="md-tooltip--left" data-md-tooltip="Latest date on which work can begin.">Latest Start Date: <time>${this.dateString(this.job.latest_start)}</time></span>`: html``} 
                    ${this.job.duration && (this.expanded == "true" || this.expandedall == "true") ? html`<span class="md-tooltip--left" data-md-tooltip="Estimated project length.">Expected Duration: ${this.job.duration} weeks</span>`: html``}
                </h5>`: html`${this.expanded == "true" || this.expandedall == "true" ? html`<h5 _ngcontent-c4 class="${this.selected_columns && (this.expanded == "false" || this.expandedall == "false") ? 'itemlen' + this.selected_columns.length: ''}">
                            ${(this.expanded == "true" || this.expandedall == "true") && this.job.priority_due.length > 0 ? html`<span class="md-tooltip--left" data-md-tooltip="Application deadline for visa-related priority consideration.">Priority Due Date:</span> <time>${this.dateString(this.job.priority_due)}</time></span>`: html``} 
                            ${(this.expanded == "true" || this.expandedall == "true") && this.job.earliest_start.length > 0 ? html`<span class="md-tooltip--left" data-md-tooltip="Earliest date on which work can begin.">Earliest Start Date: <time>${this.dateString(this.job.earliest_start)}</time></span>`: html``} 
                            ${(this.expanded == "true" || this.expandedall == "true") && this.job.latest_start.length > 0 ? html`<span class="md-tooltip--left" data-md-tooltip="Latest date on which work can begin.">Latest Start Date: <time>${this.dateString(this.job.latest_start)}</time></span>`: html``} 
                            ${(this.expanded == "true" || this.expandedall == "true") && this.job.duration ? html`<span class="md-tooltip--left" data-md-tooltip="Estimated project length.">Expected Duration: ${this.job.duration} weeks</span>`: html``}
                   </h5>`: html``}
                        
                        
                `}
                <div _ngcontent-c4>
                    ${unsafeHTML(this.job.details)}
                </div>
                <p _ngcontent-c4>Required Skills: ${this.job.skills.sort().map((item) => html`<span class="tag">${item}</span>`)}</p>
                <p _ngcontent-c4><span class="md-tooltip--right" data-md-tooltip="Any qualified student is encouraged to apply.">Program Alignment:</span> ${this.job.programs.sort().map((item) => html`<span class="tag">${item}</span>`)}</p>
                <div _ngcontent-c4>
                    ${unsafeHTML(this.job.apply)}
                </div> 
            </article>
        `;
  }
  
  createRenderRoot() {
	return this;
  }
}
if (!customElements.get('fw-job')) customElements.define('fw-job', FwJob);
if (!customElements.get('fw-job-list')) customElements.define('fw-job-list', FwJobList);
