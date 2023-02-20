const express = require('express');

const { db } = require("../firebase");

const router = express.Router();


const sessionController = require('../controllers/session');
const { stringify } = require('uuid');


async function createLocation(location){
  const name = location.name;
  const rate = location.rate;
  const deleted = false;
  const color = "red"; 
  
  const response = await db.collection("locations").add({
      name,
      rate,
      deleted,
      color
  });
  const doc = await response.get()
  return doc
  
}

exports.createLocation = async (req, res, next) => {
  const location = req.body.location;
  try {
        const doc = await createLocation(location)
        res.status(201).json({
          id: doc.id,
          ...doc.data()
          });
  } catch (error) {
  console.error(error);
  }
}

exports.loadTherapies= async (req, res, next) => {
        try {
            const querySnapshot = await db.collection("therapies").get();
            const therapies = querySnapshot.docs.map((doc) =>{
            return {
            id: doc.id,
            ...doc.data()
          }});
          res.status(201).json({
            therapies: therapies
        });
        } catch (error) {
          console.error(error);
        }
}

exports.loadLocationInvoices= async (req, res, next) => {
  try {
      const querySnapshot = await db.collection("locationInvoices").get();
      const invoices = querySnapshot.docs.map((doc) =>{
      return {
      id: doc.id,
      ...doc.data()
    }});
    res.status(201).json({
      invoices: invoices
  });
  } catch (error) {
    console.error(error);
  }
}

exports.updateLocation = async (req, res, next) => {
  const {id} = req.params;
  let data = req.body.location[id];
   try {
       await db.collection("locations").doc(id).update(data);
       const locationRef = db.collection("locations").doc(id);
       const doc = await locationRef.get();
        res.status(201).json({
          id,
          ...doc.data()
          });
      }catch (error) {
       console.error(error);
     }
}

exports.loadLocations= async (req, res, next) => {
  try {
      const locations = await getLocations();
    res.status(201).json({
      locations: locations
  });
  } catch (error) {
    console.error(error);
  }
}

async function getLocations() {
  const querySnapshot = await db.collection("locations").get();
  const locations = querySnapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data()
    };
  });
  return locations;
}

exports.getLocations = getLocations;