import NodeCache from "node-cache";

const myCatch = new NodeCache({
    stdTTL: 600,
    checkperiod: 120
})

export default myCatch;