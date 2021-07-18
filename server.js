const express = require("express")
const app = express();
const port = 3001
const bodyParser = require("body-parser")
const cors = require("cors");

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

//Models for vendor machine
//this local model can be replaced to any DB Schema
const vendorMachineIndex = {
    "lays": 1,
    "Coke": 2,
    "Parle-G": 3,
    "Diary Milk": 4
}

const vendorMachineItems = {
    1: {
        name: "lays",
        price: 10,
        units: 5
    },
    2: {
        name: "Coke",
        price: 5,
        units: 5
    },
    3: {
        name: "Parle-G",
        price: 6,
        units: 5
    },
    4: {
        name: "Diary Milk",
        price: 25,
        units: 5
    }
}


//get request to get all the items
app.get("/", (req, res) => {
    if(Object.keys(vendorMachineItems).length >= 1){
        //items are present
        res.json({
            status: "Success",
            data: vendorMachineItems
        })
    }else{
        //no item is present in the inventory
        res
        .status(404)
        .json({
            status: "Error",
            message: "Please Add new items",
            data: {}
        })
    }
})


//post Route to add the new Items to Inventory
app.post("/", (req, res) => {
    const {name, price, units} = req.body

    //check whether item is not present in the inventory list
    if(!vendorMachineIndex[name]){
        //add the item to index
        const indexArr = Object.values(vendorMachineIndex)
        indexArr.sort()

        //new Index value
        const newIndex = indexArr[indexArr.length - 1] + 1;
        vendorMachineIndex[name] = newIndex;

        vendorMachineItems[newIndex] = {
            name,
            price,
            units
        }

        res.json({
            status: "Success",
            message: "Successfully Added the new Item",
            data: vendorMachineItems
        })

    }else{
        //item is already present in the inventory
        res
        .status(501)
        .json({
            status: "Error",
            message: "Item is already there in the Inventory",
            data: {}
        })
    }
})


//put request to update the item in the inventory
app.put("/", (req, res) => {
    const {name, price, units} = req.body

    //check item is there in inventory
    if(vendorMachineIndex[name]){
        //item is already present in the inventory
        const index = vendorMachineIndex[name]

        //update the item
        vendorMachineItems[index] = {
            name,
            price,
            units
        }

        res.json({
            status: "Success",
            message: "Successfully Updated the Item"
        })
    }else{
        //item is not in the inventory
        res.status(404)
        .json({
            status: "Error",
            message: "Item is not present in the Inventory"
        })
    }
})

//delete req to delete some item in the inventory
app.delete("/:name", (req, res) => {
    const {name} = req.params

    //check if the item is there in inventory
    if(vendorMachineIndex[name]){
        //delet from the index Map
        const oldIndex = vendorMachineIndex[name]

        delete vendorMachineIndex[name]
        delete vendorMachineItems[oldIndex]

        res.json({
            status: "Success",
            message: "Successfully Deleted the Item"
        })
    }else{
        //item is not in the inventory
        res.status(404)
        .json({
            status: "Error",
            message: "Item is not present in the Inventory"
        })
    }
})

//put request to buy the item
app.put("/buy", (req, res) => {
    const {name, unit, price} = req.body

    //check item is there in inventory
    if(vendorMachineIndex[name]){
        //check the availability of units
        const index = vendorMachineIndex[name]
        const item = vendorMachineItems[index]

        if(item.units >= unit){
            //required unit is available
            //check amount is enough to buy those units
            if(price >= unit * item.price){
                //user can buy those unit
                const newUnit = item.units - unit;
                const priceToBeReturned = price - (unit * item.price);

                //update the item
                vendorMachineItems[index] = {
                    name,
                    units: newUnit,
                    price: item.price
                }

                res.json({
                    status: "Success",
                    message: "Please Collect the product and change",
                    data: {
                        priceToBeReturned
                    }
                })
            }else{
                //money is not enough to buy
                res.status(501)
                .json({
                    status: "Error",
                    message: "Amount is not enough to buy those units of Product",
                    data: {
                        priceToBeReturned: price
                    }
                })
            }

        }else{
            //Required unit is not there
            res.status(501)
            .json({
                status: 'Error',
                message: "Required Unit is not present",
                data: {
                    priceToBeReturned: price
                }
            })
        }
    }else{
        //item is not in the inventory
        res.status(404)
        .json({
            status: "Error",
            message: "Item is not present in the Inventory",
            data: {
                priceToBeReturned: price
            }
        })
    }
})

app.listen(port, () => {
    console.log(`Server started at ${port}`);
})