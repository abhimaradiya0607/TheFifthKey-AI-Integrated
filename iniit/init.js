const mongoose=require('mongoose')

const initData=require('./data.js')
const Listing=require('../models/listing.js')

MONGODB_URL="mongodb://localhost:27017/hotels"

main()
.then((res)=>{
    console.log('Connected to DB');
})
.catch((err)=>{
    console.log('Connecttion Errorr',err);
})


async function main() {
    await mongoose.connect(MONGODB_URL)
}

const initDB= async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data)
    console.log('Data Was initilized');
};

initDB();