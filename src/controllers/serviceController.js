import Service from "../models/Service.js";
import { slugifyText } from "../utils/slugifyText.js";

export async function getServices(req, res) {
  try {
    const { featured } = req.query;

    const filter = {
      status: "published",
    };

    if (featured === "true") {
      filter.featured = true;
    }

    const services = await Service.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch services.",
    });
  }
}

export async function getServiceBySlug(req, res) {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      status: "published",
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch service.",
    });
  }
}

export async function createService(req, res) {
  try {
    const {
      title,
      shortDescription,
      heroTitle,
      heroDescription,
      icon,
      image,
      features,
      benefits,
      process,
      sections,
      faqs,
      order,
      featured,
      status,
    } = req.body;

    if (!title || !shortDescription || !heroTitle || !heroDescription || !icon || !image) {
      return res.status(400).json({
        success: false,
        message:
          "Title, short description, hero title, hero description, icon, and image are required.",
      });
    }

    const slug = slugifyText(title);

    const existingService = await Service.findOne({ slug });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "A service with this title already exists.",
      });
    }

    const service = await Service.create({
      title,
      slug,
      shortDescription,
      heroTitle,
      heroDescription,
      icon,
      image,
      features,
      benefits,
      process,
      sections,
      faqs,
      order,
      featured,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create service.",
    });
  }
}

export async function updateService(req, res) {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    const updateData = { ...req.body };

    if (req.body.title && req.body.title !== service.title) {
      updateData.slug = slugifyText(req.body.title);

      const existingService = await Service.findOne({
        slug: updateData.slug,
        _id: { $ne: req.params.id },
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          message: "Another service with this title already exists.",
        });
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully.",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update service.",
    });
  }
}

export async function deleteService(req, res) {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete service.",
    });
  }
}