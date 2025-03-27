import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v.0.0.1",
    title: "Dokumentasi API Akarui",
    description: "Dokumentasi sederhana API Web App Akarui menggunakan Swagger",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Development Environment",
    },
    {
      url: "https://back-end-akarui.vercel.app/api",
      description: "Deployed Server with Vercel",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "CotoCola",
        password: "kotone123",
      },
      RegisterRequest: {
        fullName: "Melio Test",
        username: "Melio2025",
        email: "meliotest2025@yopmail.com",
        password: "melio123",
        confirmPassword: "melio123",
      },
      ActivationRequest: {
        code: "tonecantik",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventRequest: {
        name: "",
        banner: "fileUrl",
        category: "categoryId",
        description: "",
        startDate: "yyyy-mm-dd hh:mm:ss",
        endDate: "yyyy-mm-dd hh:mm:ss",
        location: {
          region: "regionId",
          coordinates: [0, 0],
        },
        isOnline: false,
        isFeatured: false,
      },
      RemoveMediaRequest: {
        fileUrl: "",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFile = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFile, doc);
