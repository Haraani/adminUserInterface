import axios from 'axios'

export default axios.create({
    baseURL: "/",   // root URL
    headers:{
        "content-type":"application/JSON",
    }
})