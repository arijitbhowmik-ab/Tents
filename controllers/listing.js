const Listing = require("../models/listing")


//Index Route
module.exports.index = async (req,res) => {
    const allListings = await Listing.find({})
    // document.getElementById("main-loader").style.display="none"
    res.render("listings/index.ejs", {allListings})
}

//new form rendering
module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs")
}
// module.exports.renderPaymentPage = (req,res) => {
//     res.render("listings/payment.ejs")
// }

module.exports.filterListings = async (req, res) => {
    try {
        let query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const allListings = await Listing.find(query);
        res.render('listings/index.ejs', { allListings });
    } catch (error) {
        res.status(500).send("Error fetching listings.");
    }
}
module.exports.createListing = async (req,res) => {
    let url = req.file.path
    let filename = req.file.filename
    const newListing = new Listing(req.body.listing)
    newListing.owner=req.user._id
    newListing.image = {url, filename}
    await newListing.save()
    req.flash("success", "New Tent added successfully!")
    res.redirect("/listings")
}

module.exports.showListing = async(req,res) => {
    let {id} = req.params
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {
        path: "author",
    },}).populate("owner")
    if(!listing){
        req.flash("error", "Your requested tent does not exist!")
        res.redirect("/listings")
    }
    res.render("listings/show.ejs", {listing})
}


module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params
    const listing = await Listing.findById(id)
    if(!listing){
        req.flash("error", "Your requested tent does not exist!")
        response.redirect("/listings")
    }
    res.render("listings/edit.ejs", {listing})
}


module.exports.updateListing = async (req,res) => {
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for Tents")
    }
    let {id} = req.params
   let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing})

   if(typeof req.file !== "undefined"){
   let url = req.file.path
   let filename = req.file.filename
   listing.image = {url, filename}
   await listing.save()
   }
   
   req.flash("success", "Tent updated successfully!")
   res.redirect(`/listings/${id}`)
}


module.exports.destroyListing = async (req,res) => {
    let {id} = req.params
    const deletedListing = await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    req.flash("success", "Tent deleted successfully")
    res.redirect("/listings")
}