const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//middleware checking if the body has a name property.
function bodyHasName(req, res, next) {
    const { data: { name } = {} } = req.body
    if (name) {
        res.locals.name = name
        return next()
    }
        next({
            status: 400,
            message: `A 'name' property is required.`,
        })
    }

//middleware to check the body has a description
function bodyHasDescription(req, res, next) {
    const { data: { description } = {} } = req.body
    if (description) {
        res.locals.description = description
        return next()
    }
        next({
            status: 400,
            message: `A 'description' property is required.`,
        })
    }


//middleware to check if the body has a price.
function bodyHasPrice(req, res, next) {
    const { data: { price } = {} } = req.body
    if (price) {
        res.locals.price = price
        return next()
    } 
        next({
            status: 400,
            message: `A 'price' property is required.`,
        })
    }

//middleware to check if dish price provided is valid.
function pricePropertyIsValid(req, res, next) {
    const { data: { price } = {} } = req.body
    if (price > -1) {
        res.locals.price = price
        return next()
    }
        next({
            status: 400,
            message: `price cannot be less than 0.`,
        })
    }


//middleware to check if dish price is valid for 'udpate()'.
function bodyHasValidPriceForUpdate(req, res, next) {
    const { data: { price } = {} } = req.body
    if (res.locals.price <= 0 || typeof res.locals.price !== "number") {
        next({
            status: 400,
            message: `price must be an integer greater than $0.`,
        })
    } 
        return next()
    }

//middleware to check if body has an image property.
function bodyHasImg(req, res, next) {
    const { data: { image_url } = {} } = req.body
    if (image_url) {
        res.locals.image_url = image_url
        return next()
    }
        next({
            status: 400,
            message: `An 'image_url' property is required.`
        })
    }

//middleware to check if the dish exists by checking dish id
function dishExists(req, res, next) {
    const { dishId } = req.params
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    if (matchingDish) {
      res.locals.matchingDish = matchingDish
      return next()
    }
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    })
}


// middleware for checking if the data id matches it's parameters id
function matchinggIds(req, res, next) {
    const { data: { id } = {} } = req.body
    const dishId = req.params.dishId
    if (id !== "" && id !== dishId && id !== null && id !== undefined) {
      next({
        status: 400,
        message: `id ${id} must match dataId provided in parameters`,
      })
    }
    return next()
}


// list
function list(req, res) {
    res.json({
        data: dishes
    })
}


// read
function read(req, res) {
    const dishId = req.params.dishId
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    res.json({ data: res.locals.matchingDish })
}


// create
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body
    const newDish = {
        id: nextId(),
        name, 
        description,
        price, 
        image_url,
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}


// update
function update(req, res) {
    const dishId = req.params.dishId
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    const { data: { name, description, price, image_url } = {} } = req.body
    matchingDish.description = description
    matchingDish.name = name
    matchingDish.price = price
    matchingDish.image_url = image_url
    res.json({ data: matchingDish })
  }

module.exports = {
    list,
    read: [dishExists, read],
    create: [
        bodyHasName, 
        bodyHasDescription,
        bodyHasPrice,
        pricePropertyIsValid,
        bodyHasImg,
        create,
    ],
    update: [
        dishExists,
        matchinggIds, 
        bodyHasName, 
        bodyHasDescription,
        bodyHasPrice,
        bodyHasImg,
        bodyHasValidPriceForUpdate,
        update,
    ],
}