// const router = require("express").Router(); //explanation for this line of code if possible pls.

const express = require("express")
const router = express.Router()
const guestModel = require("../models/guest.model.js");
const ownerModel = require("../models/owners.models.js");
const uploader = require('../config/cloudinary.config.js');


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("homepage.hbs");
});

//get, find and show all owners on allowners Page
router.get("/allpetowners", (req,res)=> {
  ownerModel.find()
    .then((owners)=> {
      console.log(owners)
      let cities = owners.map((singleOwner)=>{
          return singleOwner.city
      }).filter((elem, index, arr) => arr.indexOf(elem) === index);

      let petType = owners.map((singleOwner) => {
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
    const { ownerPet, ownerCity, image } = req.body;
    console.log(req.body)
    let obj = {}
    if(ownerPet){
      obj.ownerPet = ownerPet
    }
    if(ownerCity){
      obj.city = ownerCity;
    }
    if (image) {
      obj.image = image;
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




router.get("/guestdetails", (req, res, next) => { //last page for owners
  res.render("details/guest-details.hbs");
});


router.get("/allguests", (req, res) => {
  guestModel.find()
    .then((guests) => {
      let cities = guests  
        .map((singleGuest) => {
          console.log(singleGuest.city);
          return singleGuest.city;
        })
        .filter((elem, index, arr) => arr.indexOf(elem) === index);
            
      let petType = guests
        .map((singleGuest) => {
          console.log(singleGuest.guestPet);
          return singleGuest.guestPet;
        })
        .filter((elem, index, arr) => arr.indexOf(elem) === index);
      res.render("all-pet-lovers.hbs", { guests, cities, petType });
    })
    .catch((err) => {
      console.log("something went wrong finding guests,time to panic --->", err);
    });
});

router.get("/ownerProfile", (req,res) => {
  let userData = req.session.userData;
  res.render("profiles/owner-profile.hbs", { userData });
});

//edit owner
router.get("/:id/ownerEdit", (req,res) => {
  let id = req.params.id
  ownerModel.findById(id)
    .then((owner) => {
      res.render("profiles/owner-edit.hbs", {userData: owner})
  })
    .catch(() => {
      console.log("Edit fetch failed!");
    })
})
// this needs to run when the user submits the edit form
router.post("/:id/ownerEdit", (req,res) => {
  let userData = req.session.userData
  let id = req.params.id
  const {ownerName,ownerEmail,ownerAddress,ownerCity,ownerCountry,ownerPassword,ownerPet,aboutMe} = req.body;
  let updatedowner = {
    name: ownerName,
    email: ownerEmail,
    address: ownerAddress,
    city: ownerCity,
    country: ownerCountry,
    password: ownerPassword,
    ownerPet: ownerPet,
    aboutMe: aboutMe,
  };

  ownerModel.findByIdAndUpdate(id,updatedowner)
  //then -> redirect the user
    .then(()=> {
      res.redirect("/ownerProfile");
    })
    .catch(()=> {
      console.log("Edit failed")
    })
  // res.render("profiles/owner-edit.hbs", {userData});
})
//delete
router.get("/:id/ownerDelete", (req,res) =>{
    let id = req.params.id;
    ownerModel.findByIdAndDelete(id)
  //then -> redirect the user
    .then(()=> {
      res.redirect("/")
    })
    .catch(()=> {
      console.log("Delete failed")
    })
})

// showing the image on guest profile page
router.get("/guestProfile", (req, res) => {
  let id = req.session.userData._id   // best practice when you want to get any info from the loged in user.
  guestModel.findById(id)
  .then((userData)=> {
    res.render("profiles/guest-profile.hbs", { userData });
  })
  .catch(()=> {
    console.log("something went wrong")
  })
});

// showing the image on owner profile page
router.get("/ownerProfile", (req, res) => {
  let id = req.session.userData._id; // best practice when you want to get any info from the loged in user.
  ownerModel.findById(id)
    .then((userData) => {
      res.render("profiles/owner-profile.hbs", { userData });
    })
    .catch(() => {
      console.log("something went wrong");
    });
});

//edit guest
router.get("/:id/guestEdit", (req,res) => {
    let id = req.params.id
    // get all the todo info to show on the edit form
    guestModel.findById(id)
        .then((guest) => {
            res.render("profiles/guest-edit.hbs", {userData: guest})
        })
        .catch(() => {
            console.log("Edit fetch failed!")
        })
})



// this needs to run when the user submits the edit form
router.post("/:id/guestEdit", (req,res) => {
  let userData = req.session.userData
  let id = req.params.id
  const {guestName,guestEmail,guestAddress,guestCity,guestCountry,guestPassword,guestPet,aboutMe} = req.body;
  console.log(req.body)
  let updatedGuest = {
    
    name: guestName,
    email: guestEmail,
    address: guestAddress,
    city: guestCity,
    country: guestCountry,
    password: guestPassword,
    guestPet: guestPet,
    aboutMe: aboutMe,
  };

  guestModel.findByIdAndUpdate(id,updatedGuest)
  //then -> redirect the user
    .then(()=> {
      res.redirect("/guestProfile");
    })
    .catch(()=> {
      console.log("Edit failed")
    })
  // res.render("profiles/guest-edit.hbs", {userData});
})


//upload pic for guest --make another for owner
router.post('/uploadGuest', uploader.single("imageUrl"), (req, res, next) => {
    // the uploader.single() callback will send the file to cloudinary and get you and obj with the url in return
    console.log('file is: ', req.file)
    console.log(req.session.userData)
    
    if (!req.file) {
      console.log("there was an error uploading the file")
      next(new Error('No file uploaded!'));
      return;
    }
    guestModel.findByIdAndUpdate(req.session.userData._id, {image: req.file.path})
    .then(() => {      
      res.redirect("/guestProfile");
    })
    .catch(()=> {
      console.log("something went wrong adding photo")
    })
    // You will get the image url in 'req.file.path'
    // Your code to store your url in your database should be here
})

router.post("/uploadOwner", uploader.single("imageUrl"), (req, res, next) => {
  // the uploader.single() callback will send the file to cloudinary and get you and obj with the url in return
  console.log("file is: ", req.file);
  console.log(req.session.userData);

  if (!req.file) {
    console.log("there was an error uploading the file");
    next(new Error("No file uploaded!"));
    return;
  }
  ownerModel.findByIdAndUpdate(req.session.userData._id, { image: req.file.path })
    .then(() => {
      res.redirect("/ownerProfile");
    })
    .catch(() => {
      console.log("something went wrong adding photo");
    });
});


//delete
router.get("/:id/guestDelete", (req,res) =>{
    let id = req.params.id;
    guestModel.findByIdAndDelete(id)
  //then -> redirect the user
    .then(()=> {
      res.redirect("/")
    })
    .catch(()=> {
      console.log("Delete failed")
    })
})



//route from all guests to filtered guests
router.get("/filteredGuests", (req, res, next) => {
  res.render("filtered-pet-lovers.hbs")
})
router.post("/filteredGuests", (req, res, next) => {
  const { guestName, guestCity, image } = req.body;
  console.log(req.body);
  let obj = {};
  if (guestName) {
    obj.guestName = guestName;
  }
  if (guestCity) {
    obj.city = guestCity;
  }
  if (image) {
    obj.image = image; //i just added this
  }
  guestModel.find(obj)
    .then((result) => {
      console.log(result);
      res.render("filtered-pet-lovers.hbs", { result });
    })
    .catch((err) => {
      console.log("sth is wrong", err);
    });
});

//displaying details of a specific owner on details page

router.get("/:id/ownerdetails", (req, res) => {
  let id = req.params.id;

  ownerModel.findById(id)
    .then((result) => {
      res.render("details/owner-details.hbs", { result });
    })
    .catch(() => {
      console.log("failed!");
    });
});
//displaying details of a specific owner on details page

router.get("/:id/guestdetails", (req, res) => {
  let id = req.params.id;

  guestModel.findById(id)
    .then((result) => {
      res.render("details/guest-details.hbs", { result });
    })
    .catch(() => {
      console.log("failed!");
    });
});



module.exports = router;
