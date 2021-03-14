const express  = require('express');
const bodyParser = require('body-parser');
const Suggestion = require('../models/suggestions');
const cors = require('./cors');
var authenticate = require('../authenticate');
const suggestionRouter = express.Router();
suggestionRouter.use(bodyParser.json());

suggestionRouter.route('/')
.get(cors.cors,(req,res,next)=>{
    Suggestion.find(req.query)
      .then((sugg) =>{
          res.statusCode = 200;
          res.setHeader('Content-Type','application/json');
          res.json(sugg);
      },(err) => next(err))
      .catch((err)=>next(err));
})
.post(cors.cors,authenticate.verifyUser,(req,res,next)=>{
    Suggestion.create(req.body)
    .then((sugg)=>{
        console.log('Suggestion created',sugg);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(sugg);  
    }, (err)=>next(err))
    .catch((err)=>next(err))
})
.put(cors.cors,authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next) =>{
    res.statusCode=403;
    res.end(' not supported on /suggestions')
})

.delete(cors.cors,authenticate.verifyUser,(req,res,next) =>{
    Suggestion.remove({})
    .then((resp) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err) => next(err))
    .catch((err)=>next(err))
})

module.exports = suggestionRouter;