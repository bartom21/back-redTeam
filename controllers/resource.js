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