const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

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

exports.updateTherapy = async (req, res, next) => {
  const {id} = req.params;
  const {rate} = req.body
   try {
       await db.collection("therapies").doc(id).update({rate:rate});
       const therapyRef = db.collection('therapies').doc(id);
       const doc = await therapyRef.get();
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
      const querySnapshot = await db.collection("locations").get();
      const locations = querySnapshot.docs.map((doc) =>{
      return {
      id: doc.id,
      ...doc.data()
    }});
    res.status(201).json({
      locations: locations
  });
  } catch (error) {
    console.error(error);
  }
}