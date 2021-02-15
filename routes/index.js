// const router = require("express").Router(); //explanation for this line of code if possible pls.

const express = require("express")
const router = express.Router()
const guestModel = require("../models/guest.model.js");
const ownerModel = require("../models/owners.models.js");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("homepage.hbs");
});

//get, find and show all owners on allowners Page
router.get("/allpetowners", (req,res)=> {
  ownerModel.find()
    .then((owners)=> {
      let cities = owners.map((singleOwner)=>{
          return singleOwner.city
      }).filter((elem, index, arr) => arr.indexOf(elem) === index);

      let petType = owners
        .map((singleOwner) => {
          return singleOwner.ownerPet;
        }).filter((elem, index, arr) => arr.indexOf(elem) === index);
      res.render("all-pet-owners.hbs", { owners,cities, petType });
      
    })
    .catch(()=>{
      console.log("something went wrong finding owners,time to panic")
    })
  
});
// route from allowners page to search and filtered owners page
router.get("/filteredowners", (req, res, next)=> {  
  res.render("filtered-pet-owners.hbs");
});

router.post("/filteredowners", (req,res,next) =>{
    const { ownerPet, ownerCity } = req.body;
    console.log(req.body)
    let obj = {}
    if(ownerPet){
      obj.ownerPet = ownerPet
    }
    if(ownerCity){
      obj.city = ownerCity;
    }
    ownerModel.find(obj)
      .then((result)=>{
        console.log(result)
        res.render("filtered-pet-owners.hbs", { result });
      })
      .catch((err)=>{
          console.log("sth is wrong", err);
      })
});
//how to make a search button on all pet owners page send use to filtered owners page? 

router.get("/ownerdetails", (req, res, next) => {

  res.render("details/owner-details.hbs");
});


module.exports = router;


