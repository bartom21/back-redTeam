const express = require('express');

const { db } = require("../firebase");

const router = express.Router();

const cron = require("node-cron");

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
          const therapies = await loadTherapies();
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
      let locations = await getLocations();
      locations = locations.filter(loc => !loc.deleted)
    res.status(201).json({
      locations: locations
  });
  } catch (error) {
    console.error(error);
  }
}

exports.loadNotDeletedLocations= async (req, res, next) => {
  try {
      const locations = await getLocations();
    res.status(201).json({
      locations: locations
  });
  } catch (error) {
    console.error(error);
  }
}

async function loadTherapies() {
  const querySnapshot = await db.collection("therapies").get();
  const therapies = querySnapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data()
    };
  });
  return therapies;
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




//check every month
cron.schedule("0 0 1 * *", async () => {
  try{
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    const appointments = await sessionController.querySessions();
    const therapiesNotParsed = await loadTherapies();
    let therapies = {}
    for(therapy of therapiesNotParsed){
      therapies[therapy.id] = therapy.name
    }
    let locations = await getLocations();

    const today = new Date();
    const last_month =  new Date();
    last_month.setDate(last_month.getMonth() - 1);

    let invoices = {}
    let invoice = {}
    //locations = locations.filter( x => !x.deleted) //Por si quisieras no hacer reportes para salas ya eliminadas
    for(location of locations){
      invoice = {
        amount: 0,
        location: {id: 1, name: "aa", rate: 0},
        month: meses[parseInt(last_month.getMonth())],
        year: parseInt(last_month.getYear() + 1900),
        sessions: [],
      }
      invoice.location.id = location.id
      invoice.location.name = location.name
      invoice.location.rate = location.rate
      invoices[location.id] = invoice
    }
    console.log(invoices)
    
    var diff = 0
    let montoSesion = 0
    for (const appointment of appointments){
      if(appointment.state == "finalized" &&  ( last_month <= new Date(appointment.startDate))){
        diff = ((new Date(appointment.endDate)).getTime() - (new Date(appointment.startDate)).getTime()) / 1000;
        diff /= (60 * 60);
        montoSesion = diff * parseInt(invoices[appointment.location].location.rate);
        invoices[appointment.location].amount += montoSesion
        const x = {
          startDate: appointment.startDate,
          endDate: appointment.endDate,
          title: appointment.title,
          therapy: therapies[appointment.therapy],
          amount: montoSesion
        }
        invoices[appointment.location].sessions.push(x)

      }
    };
    let response = ''
    let doc = ''
    for(let invoice in invoices){
      if(invoices[invoice].amount !== 0){
        response = await db.collection("locationInvoices").add(invoices[invoice]);
        doc = await response.get()
      }
    }
  }catch{
    console.log(error)
    console.log("hola")
  }
});