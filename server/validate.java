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
package edu.duke.fuqua.oauth2;

import edu.duke.fuqua.jwtsupport.JWTLogic;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jose4j.jwk.HttpsJwks;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.MalformedClaimException;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.keys.resolvers.HttpsJwksVerificationKeyResolver;
import org.jose4j.lang.JoseException;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author conder
 */
@WebServlet(name = "validate", urlPatterns = {"/validate"})
public class validate extends HttpServlet {
    
    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, JSONException, 
            ParseException, UnsupportedEncodingException, InvalidJwtException, 
            JoseException, MalformedClaimException {
        
        try {   
            
            JSONObject resp = new JSONObject();
            
            // Get the JWT
            String authorization = request.getHeader("Authorization");
            String jwt = null;
            Integer max_age = 0;
            if (authorization == null) {
                Cookie[] cookies = request.getCookies();
                for (int i=0; i < cookies.length; i++) {
                    if (cookies[i].getName().equals(JWTLogic.COOKIE_DEFAULT)) {
                        jwt = cookies[i].getValue();
                        max_age = cookies[i].getMaxAge();
                    }
                }
            } else {
                if (authorization.trim().toLowerCase().startsWith("bearer")) {
                    String[] authorizations = authorization.split(" ");
                    jwt = authorizations[1].trim();
                }
            }
            
            Boolean isValid = Boolean.FALSE;
            JSONObject claims = null;
        
            try {
                claims = JWTLogic.getClaims(jwt);
                
                JSONObject headers = JWTLogic.getHeader(jwt);
                JSONObject jwtclaims = JWTLogic.getClaims(jwt);
                JwtConsumer jwtConsumer = null;
                if (headers.has("kid")) { 
                        // Validate ticket
                        HttpsJwks httpsJkws = new HttpsJwks("https://go.fuqua.duke.edu/auth/jwks");
                        HttpsJwksVerificationKeyResolver httpsJwksKeyResolver = 
                                new HttpsJwksVerificationKeyResolver(httpsJkws);

                        jwtConsumer = new JwtConsumerBuilder()
                            .setVerificationKeyResolver(httpsJwksKeyResolver)
                            .setRequireExpirationTime() // the JWT must have an expiration time
                            .setAllowedClockSkewInSeconds(5) // allow some leeway in validating time based claims to account for clock skew
                            .setRequireSubject() // the JWT must have a subject claim
                            .setSkipDefaultAudienceValidation()
                            .build();
                        
                        try {
                            JwtClaims verifiedClaims = jwtConsumer.processToClaims(jwt);
                            resp = new JSONObject(verifiedClaims.toJson());
                            isValid = Boolean.TRUE;
                        } catch (InvalidJwtException ex) {
                            response.setStatus(401);
                        }
                }    
                        
        } catch (Exception ex) {
            response.setStatus(401);
        }        
        
        // Get the user profile if requested (must be valid)
        if (isValid) {
            LDAP ldap = new LDAP();
            org.json.JSONArray users = null;
            try {
                users = ldap.findUserByUIDorFID(claims.getString("sub"));
            } catch (NamingException ex) {
            }
            if (users != null && users.length() == 1) {
                JSONObject user = users.getJSONObject(0);
                resp.put("profile", user);
                try {
                    JSONObject groups = ldap.getGroups(user);
                    if (groups.has("groups")) {
                        resp.put("groups", groups.getJSONArray("groups"));
                    }
                } catch (Throwable x) {       
                }
                                
            } 
       
        }
        resp.put("valid", isValid);
        resp.put("ok", Boolean.TRUE);
        
        // Send back JSON with data
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        try {
            out.println(resp.toString());
        } finally {
            out.close();
        }         
          
     } catch (Throwable x) {
         response.setStatus(401);
     }
        
    }
    

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, UnsupportedEncodingException {
        try {
            processRequest(request, response);
        } catch (JSONException ex) {
            throw new ServletException(ex);
        } catch (ParseException ex) {
            throw new ServletException(ex);
        } catch (InvalidJwtException ex) {
            throw new ServletException(ex);
        } catch (JoseException ex) {
            throw new ServletException(ex);
        } catch (MalformedClaimException ex) {
            throw new ServletException(ex);
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException, UnsupportedEncodingException {
        try {
            processRequest(request, response);
        } catch (JSONException ex) {
            throw new ServletException(ex);
        } catch (ParseException ex) {
            throw new ServletException(ex);
        } catch (InvalidJwtException ex) {
            throw new ServletException(ex);
        } catch (JoseException ex) {
            throw new ServletException(ex);
        } catch (MalformedClaimException ex) {
            throw new ServletException(ex);
        }
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
