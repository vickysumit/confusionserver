const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Favorites = require('../models/favorites'); 

const favoriteRouter = express.Router();

let authenticate = require('../authenticate');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res)=> {res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
	Favorites.findOne({user : req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
	console.log(req.user._id)
	Favorites.findOne({user : req.user._id})
    .then((favorite) => {
    	console.log(req.body)
    	console.log(favorite)
        if (favorite != null) {
        	for(let i of req.body){
        		let f = false
        		for(let j of favorite.dishes){
        			
	        		if(i._id.toString() === j._id.toString()){
	        			f = true
	        		}
        		}
        		if(f == false){
        			favorite.dishes.push(i)
        		}
        	}
        	
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })            
            }, (err) => next(err));
        }
        else {
            let fav = new Favorites({user: req.user._id,dishes: req.body});
            Favorites.create(fav)
		    .then((favorite) => {
		        res.statusCode = 200;
		        res.setHeader('Content-Type', 'application/json');
		        res.json(favorite);
		    }, (err) => next(err))
		    .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
	Favorites.deleteOne({ user: req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res)=> {res.sendStatus(200);})
.get(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id})
    .then((favorites)=>{
        if(!favorites){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            return res.json({"exits":false,"favorites":favorites});
        }
        else{
            if(favorites.dishes.indexOf(req.params.dishId)<0){
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exits":false,"favorites":favorites});               
            }
            else{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exits":true,"favorites":favorites});
            }
        }
    },(err)=>next(err))
    .catch((err)=>next(err))
    /*res.statusCode = 403;
    res.end('GET operation not supported on /favorites/dishId');*/
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
	console.log(req.user._id)
	Favorites.findOne({user : req.user._id})
    .then((favorite) => {

        if (favorite != null) {
        	
    		let f = false
    		for(let j of favorite.dishes){
    			
        		if(req.params.dishId === j._id.toString()){
        			f = true
        		}
    		}
    		if(f == false){
    			const newId = new mongoose.Types.ObjectId(req.params.dishId);
    			favorite.dishes.push(newId)
    		}
        	
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })            
            }, (err) => next(err));
        }
        else {
            let fav = new Favorites({user: req.user._id});
            console.log(fav)
            const newId = new mongoose.Types.ObjectId(req.params.dishId);
			fav.dishes.push(newId)
            Favorites.create(fav)
		    .then((favorite) => {
		        res.statusCode = 200;
		        res.setHeader('Content-Type', 'application/json');
		        res.json(favorite);
		    }, (err) => next(err))
		    .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/dishId');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
	Favorites.updateOne( {user: req.user._id}, { $pullAll: {dishes: [req.params.dishId] } } )
	.then((fav) => {
                    Favorites.findOne({user : req.user._id})
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);  
                    })               
                }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;