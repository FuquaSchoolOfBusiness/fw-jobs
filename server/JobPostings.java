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
package edu.duke.fuqua.job_postings;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.net.MalformedURLException;
import java.util.Map;
import java.util.UUID;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@Path("jobs")
public class JobPostings {
    
    @Context ServletContext context;
    @Context ServletConfig servletcontext;
    @Context private HttpServletRequest req;
    
    private Logger logger = Logger.getLogger("JobPostings");
    
    @GET
    @Path("demo/configuration")
    @Produces("application/json")
    public String getConfiguration(@PathParam("id")String id) throws JSONException, Throwable {
        return this.getConfiguration().toString();
    }
    
    @GET
    @Path("demo/postings")
    @Produces("application/json")
    public String getJobPostings(@PathParam("id")String id) throws JSONException, Throwable {
        return this.getJobPostings().toString();
    }
 
    @POST
    @Path("demo/postings")
    @Consumes("application/json")
    @Produces("application/json")
    public String saveJobPostings(String content) throws JSONException, Throwable {
        JSONObject postings = new JSONObject(content);
        
        CloudantClient client = ClientBuilder.url(new java.net.URL(context.getInitParameter("database_url")))
                                     .username(context.getInitParameter("database_uid"))
                                     .password(context.getInitParameter("database_pd"))
                                     .build();
        
        Database db = client.database("student-job-postings", Boolean.TRUE);
        
        if (postings.has("organization")) {
            if (!postings.has("uuid")) {
               postings.put("uuid", UUID.randomUUID().toString());
            }
            if (!postings.has("_id")) {
                postings.put("_id", postings.getString("uuid"));
            }
        }
        
        Map map = new Gson().fromJson(postings.toString(), Map.class);      
        com.cloudant.client.api.model.Response res = 
                postings.has("_rev") ? db.update(map): db.save(map);        
        JSONObject resp = new JSONObject();

        return resp.toString();
    }
    
    @DELETE
    @Path("demo/postings")
    @Consumes("application/json")
    @Produces("application/json")
    public String deleteJobPostings(String content) throws JSONException, Throwable {
        JSONObject postings = new JSONObject(content);
        
        CloudantClient client = ClientBuilder.url(new java.net.URL(context.getInitParameter("database_url")))
                                     .username(context.getInitParameter("database_uid"))
                                     .password(context.getInitParameter("database_pd"))
                                     .build();
        
        Database db = client.database("student-job-postings", Boolean.TRUE);
        
        db.remove(postings.getString("_id"), postings.getString("_rev"));
                        
        JSONObject resp = new JSONObject();

        return resp.toString();
    }
    
    private JSONArray getJobPostings() throws MalformedURLException, JSONException, InterruptedException {

        CloudantClient client = ClientBuilder.url(new java.net.URL(context.getInitParameter("database_url")))
                                     .username(context.getInitParameter("database_uid"))
                                     .password(context.getInitParameter("database_pd"))
                                     .build();
        
        Database db = client.database("student-job-postings", Boolean.TRUE);
        
        JSONObject selector = new JSONObject();
        JSONObject s_id = new JSONObject();
        s_id.put("$gt", "0");
        selector.put("uuid", s_id);      

        JSONArray config = null;
        Integer retry_count = 0;
        while (retry_count < 3) {
            try {
                config = 
                    new JSONArray(db.findByIndex(selector.toString(), JsonObject.class).toString());
                retry_count = 5;
            } catch (Throwable _t) {
                if (_t.getMessage() != null && _t.getMessage().indexOf("429") > -1) {
                    if (retry_count == 2) throw _t;
                    Thread.sleep(1000);
                    retry_count++;
                } else {
                    retry_count = 5;
                }            
            }
        }
        retry_count = 0;
        return config;        
    }
    
    private JSONObject getConfiguration() throws MalformedURLException, InterruptedException {
        CloudantClient client = ClientBuilder.url(new java.net.URL(context.getInitParameter("database_url")))
                                     .username(context.getInitParameter("database_uid"))
                                     .password(context.getInitParameter("database_pd"))
                                     .build();
        Database db = client.database("student-job-postings", Boolean.TRUE);        
        Integer retry_count = 0;
        while (retry_count < 3) {
            try {
                return 
                    new JSONObject(db.find(JsonObject.class, "student_jobs_2020").toString());
            } catch (Throwable _t) {
                if (_t.getMessage().indexOf("429") > -1) {
                    if (retry_count < 2) {
                        Thread.sleep(1000);
                        retry_count++;
                    }
                } else {
                    retry_count = 5;
                }            
            }
        }
        return new JSONObject();
    }
}
