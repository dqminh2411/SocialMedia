class Utils{
    constructor(){};
    formatDateTime = (timestamp) =>{
        const date = new Date(timestamp);
        return date.toLocaleTimeString() + " " + date.toLocaleDateString();
    }
}

export default new Utils();