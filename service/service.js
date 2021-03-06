const axios = require('axios');
const WS_URL = 'https://localhost:443';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class Service {
    constructor(){
        this.baseUrl = WS_URL;
    }
    /**
     * Used to set the baseUrl to ws_url
     */
    set_url(url){
        this.baseUrl = url;
    }
    /**
     * Used to create a new user at proj3
     * gets a user object as an input and sends a put request at proj3 with all of the
     * fields in tact. If something goes wrong returns the appropriate fields of the
     * error object.
     */
    async newUser(user){
        try{
            const resp = await axios.put(`${this.baseUrl}/users/${userId}?pw=${user.pw}`, user, { maxRedirects: 0 });
            const location = resp.headers.location;
            const userId = location.substr(location.lastIndexOf('/')+1);
            return resp.data;
        }catch(err){
            let error = {};
            error.status = err.response.status;
            error.info = err.response.data.info;
            console.error(err);
            return error;
        }
    }
    /**
     * Used to authorize a user.
     * Gets a user object as an input, which contains the userId and pw.
     * Does a put request at proj3 /users/:userId/auth with the user object
     * returns the response. If something goes wrong returns the appropriate fields
     * of the error object.
     */
    async authorizeUser(user){
        try{
            const response = await axios.put(`${this.baseUrl}/users/${user.userId}/auth`, user);
            return response.data;
        }catch(err){
            let error = {};
            error.status = err.response.status;
            error.info = err.response.data.info;
            console.error(err);
            return error;
        }
    }
    /**
     * Used get the user's resources.
     * Gets a user object which contains userId and the auth token.
     * Does a get request at proj3 /users/:userId with the authorization : Bearer token
     * If all goes well returns the response, if not returns the appropriate fields of
     * the error object.
     */
    async getUser(user){
        try{
            let auth = user.auth;
            const response = await axios({
                method:'get',
                url:`${this.baseUrl}/users/${user.userId}`,
                headers: {
                authorization : auth
                }
            });
            return response.data;
        }catch(err){
            let error = {};
            error.status = err.response.status;
            error.info = err.response.data.info;
            console.error(err);
            return error;
        }
    }
}

module.exports = new Service();
