"use strict";

/**
 *  busbulkfile controller
 */
const reader = require("xlsx");
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::busbulkfile.busbulkfile",
  ({ env }) => ({
    async create(ctx) {
      const response = await super.create(ctx);

      console.log(response);

      const fileResponse = await strapi.entityService.findOne(
        "api::busbulkfile.busbulkfile",
        response.data.id,
        {
          populate: {
            excelfile: true,
          },
        }
      );

      let filePath = "/Users/shivakanya/MyData/bus10.xlsx";
    
     
      const exceldata = [];
      if (filePath) {
        const file = reader.readFile(filePath);
        const sheets = file.SheetNames;
        for (let i = 0; i < sheets.length; i++) {
          const temp = reader.utils.sheet_to_json(
            file.Sheets[file.SheetNames[i]]
          );
          temp.forEach((res) => {
            exceldata.push(res);
          });
        }
      
      }
      let finalInsertArray = [];
      for (let i = 0; i < exceldata.length; i++) {
        let statusText = "SUCCESS";
        let status = true;
        let errorObj = "";

        try {
          const entry = await strapi.entityService.create("api::bus.bus", {
            data: {
              vehicle_number: exceldata[i].Vehicle_Number,
              seating_capacity: exceldata[i].Seating_Capacity,
              colour: exceldata[i].Color,
            },
          });
         
        } catch (error) {
          statusText = "ERROR";
          status = false;
          let errObj = error.details;

         

          for (let i = 0; i < errObj.errors.length; i++) {
            errorObj =
              errorObj +
              i +
              "." +
              errObj.errors[i].path[0] +
              " - " +
              errObj.errors[i].message;
          }
        }

        try {
          const logentry = await strapi.entityService.create(
            "api::busbulkuploadlog.busbulkuploadlog",
            {
              data: {
                vehicle_number: exceldata[i].Vehicle_Number,
                seating_capacitu: exceldata[i].Seating_Capacity,
                color: exceldata[i].color,
                statustext: statusText,
                error: errorObj,
                status: status,
                busbulkfile: fileResponse.id,
              },
            }
          );
        } catch (errorl) {}
      }

      return response;
    },
  })
);