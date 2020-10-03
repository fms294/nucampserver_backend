const express = require('express')
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
const Favorite = require('../models/favorite');

favoriteRouter.route('/')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
.get(cors.cors,(req, res, next) => {
    Favorite.findOne({user:req.user._id})
     .populate('user')
     .populate('campsites')
     .then(favorites =>{
         res.statusCode = 200;
         res.setHeader('Content-Type' , 'application/json');
         res.json(favorites);
     })
     .catch(err =>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
     .then(favorites => {
         if(favorites){
             req.body.forEach((fav) =>{
                if(!favorites.campsites.includes(fav._id)){
                    favorites.campsites.push(fav._id);
                }
             });
             favorites.save()
                .then((favorites) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type' , 'application/json');
                    res.json(favorites);
            })
            .catch(err =>next(err));
         }else{
            Favorite.create({
                user: req.user._id,
                campsites: req.body
            })
            .then((favorites) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.json(favorites);
           })
            .catch((err) => next(err));

         }
         console.log('Campsite Created', campsite);
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         res.json(campsite);
     })
     .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,  (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
      .then((favorites)=>{
          if(favorites){
              favorites.remove();
              res.statusCode= 200;
              res.setHeader('Content-Type', 'application/json');
              res.end("Successfully removed " + favorites );
          }else{
            res.statusCode= 200;
            res.setHeader('Content-Type', 'application/json');
            res.end("No document found "  );
          }
      })
     .catch(err => next(err));
});


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => res.sendStatus(200))
.get(cors.corsWithOptions, authenticate.verifyUser,  (req, res) => {
    res.statusCode = 403;
    res.end('GET operation is not supported');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
     .then(favorites => {
        if(favorites){
            if(!favorites.campsites.includes(req.params.campsiteId)){
                favorites.campsites.push(campsiteId);  
                favorites.save()
                .then((favorites) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type' , 'application/json');
                    res.json(favorites);
            })
            .catch(err =>next(err));
            }else{
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.send("The campsite is already in the list of favorites.");
            }
         }else{
            Favorite.create({
                user: req.user._id,
                campsites: req.params.campsiteId
            })
            .then((favorites) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.json(favorites);
           })
            .catch((err) => next(err));

         }
     })
     .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,  (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user:req.user._id})
       .then((favorites) =>{
         if(favorites){
           const index= favorites.campsites.indexOf(req.params.campsiteId)
           if( index > -1){
               favorites.campsites.splice(index, 1)
               favorites.save()
                .then(favorites =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type' , 'application/json');
                    res.end("Successufully removed: " + campsiteId);
            })
           }else{
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.end("Campsite not found: ");
           }
        }else{
            res.statusCode = 200;
            res.setHeader('Content-Type' , 'application/json');
            res.end("No favorites exist");
       }})
       .catch(err =>next(err));
});

module.exports = favoriteRouter;