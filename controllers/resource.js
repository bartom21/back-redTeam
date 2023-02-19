const express = require('express');

const { db } = require("../firebase");

const router = express.Router();


const sessionController = require('../controllers/session');
const { stringify } = require('uuid');

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

exports.updateLocation = async (req, res, next) => {
  const {id} = req.params;
  const {rate} = req.body
   try {
       await db.collection("locations").doc(id).update({rate:rate});
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