const mongoose = require('mongoose');
const initData = require('./data')
const Listing = require('../models/listing')

const MONGO_URL = 'mongodb://127.0.0.1:27017/mydb'

main().then(()=>{
    console.log("Connected to DB")
})
.catch((err)=> {
    console.log("Error : ", err)
})

async function main() {
    await mongoose.connect(MONGO_URL)
}

const initDB = async () => {
    await Listing.deleteMany({})
    initData.data = initData.data.map((obj)=>({...obj, owner: "67c76a9345d7a9d2e1065df4"}))
    await Listing.insertMany(initData.data)
    console.log("Data was initialized")
}
initDB()