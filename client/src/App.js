import './App.css';

import { Card, Modal, notification } from 'antd';
import {useCallback, useEffect, useState} from "react"

import axios from "axios"

function App() {
  const [products, setProducts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [type, setType] = useState("buy")
  const [name, setName] = useState("")
  const [units, setUnits] = useState(0)
  const [price, setPrice] = useState(0)

  const openNotificationWithIcon = (type, message, description = "") => {
  notification[type]({
    message,
    description
  });
};

  const getProducts = useCallback(
    async () => {
      try {
       const result = await axios.get("http://localhost:3001/");
       const product = result.data.data;
       setProducts(Object.values(product))

      } catch (error) {
        console.log("error", error.response.data);
        const message = error.response.data ? error.response.data.message : 'Error in fetching Items'
        openNotificationWithIcon("error", message)
        setProducts([])
      }
    },
    [],
  )

  const onBuy = () => {
    setType("buy")
    setIsModalOpen(true)
  }

  const onAdd = () => {
    setType("add")
    setIsModalOpen(true)
  }

  const onDelete = () => {
    setType("delete")
    setIsModalOpen(true)
  }

  const onChange = (e) => {
    if(e.target.name === 'Name'){
      setName(e.target.value)
    }else if(e.target.name === "Units"){
      setUnits(e.target.value)
    }else if(e.target.name === "Price"){
      setPrice(e.target.value)
    }
  }

  const onCancel = () => {
    if(price > 0){
      openNotificationWithIcon("info", "You cancelled the process", `Please collect the change ${price} of RS`)
    }

    setIsModalOpen(false)
    setName("")
    setPrice(0)
    setUnits(0)
  }

  const modalContent = () => {
    if(type === "buy"){
      return (
        <div className="add-form">
          <label>Name: </label>
          <input type="text" name="Name" value={name} onChange={onChange}/>
          <label>Units: </label>
          <input type="number" name="Units" value={units} onChange={onChange} />
          <label>Price: </label>
          <input type="number" name="Price" value={price} onChange={onChange} />
          <input type="button" value="Submit" onClick={async (e) => {
            if(e.preventDefault) e.preventDefault()
            setIsModalOpen(false)
            try {
             const result = await axios.put("http://localhost:3001/buy", {
              name,
              price,
              unit: units
            }) 

            await getProducts()

            if(result.data.status === "Success"){
              openNotificationWithIcon("success", result.data.message, `Please Collect the Change of ${result.data.data.priceToBeReturned} Rs` )
            }

            } catch (error) {
              openNotificationWithIcon("error", error.response.data.message, `Please Collect the Change of ${error.response.data.data.priceToBeReturned} Rs`)
            }

          }} />
        </div>
      )
    }else if(type === "add"){
      return (
        <div className="add-form">
          <label>Name: </label>
          <input type="text" name="Name" value={name} onChange={onChange} />
          <label>Units: </label>
          <input type="number" name="Units" value={units} onChange={onChange} />
          <label>Price: </label>
          <input type="number" name="Price" value={price} onChange={onChange} />
          <button onClick={async (e) => {
            if(e.preventDefault) e.preventDefault()
            setIsModalOpen(false)
            try {
              const result = await axios.post("http://localhost:3001", {
                name,
                units,
                price
              })

              await getProducts()

              if(result.data.status === "Success"){
                openNotificationWithIcon("success", result.data.message )
              }

            } catch (error) {
              openNotificationWithIcon("error", error.response.data.message)
            }
          }}>
            Submit
          </button>
        </div>
      )
    }else if(type === "delete"){
      return (
        <div className="add-form">
          <label>Name: </label>
          <input type="text" name="Name" value={name} onChange={onChange} />
          <button onClick={async (e) => {
            if(e.preventDefault) e.preventDefault()
            setIsModalOpen(false)
            try {
              const result = await axios.delete(`http://localhost:3001/${name}`)

              await getProducts()

              if(result.data.status === "Success"){
                openNotificationWithIcon("success", result.data.message )
              }

            } catch (error) {
              openNotificationWithIcon("error", error.response.data.message)
            }
          }}>
            Submit
          </button>
        </div>
      )
    }
  }

  useEffect(() => {
    getProducts()
  }, [getProducts])

  return (
    <div className="App">
      <div className="header">
        <h1>Product List</h1>
      </div>
      <div className="content">
        {products.map((product, index) => (
          <Card key={`${product.name}-${index}`} title={product.name} bordered={false} style={{ width: 300 }}>
            <p>Name: {product.name}</p>
            <p>Units: {product.units}</p>
            <p>Price: {product.price}</p>
            <p>Available: {product.units > 0 ? "Yes" : "No"}</p>
          </Card>
        ))}
      </div>
      <button className="floating-btn" onClick={onAdd}>
        <i class="fas fa-plus"></i>
      </button>
      <button className="floating-btn" id="delete-btn" onClick={onDelete}>
        <i class="fas fa-minus"></i>
      </button>
      <button className="floating-btn" id="buy-btn" onClick={onBuy}>
        <i class="fas fa-shopping-cart"></i>
      </button>
      <Modal 
        visible={isModalOpen} 
        onCancel={onCancel} 
        footer={(
          <button onClick={onCancel} className="ant-btn ant-btn-primary">Cancel</button>
        )}
        destroyOnClose
      >
        {modalContent()}
      </Modal>
    </div>
  );
}

export default App;
