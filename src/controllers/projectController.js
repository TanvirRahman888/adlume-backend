import Project from "../models/Project.js";
import { slugifyText } from "../utils/slugifyText.js";

export async function getProjects(req, res) {
  try {
    const { category, featured } = req.query;

    const filter = {
      status: "published",
    };

    if (category && category !== "All Projects") {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const projects = await Project.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch projects.",
    });
  }
}

export async function getProjectBySlug(req, res) {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      status: "published",
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch project.",
    });
  }
}

export async function createProject(req, res) {
  try {
    const {
      title,
      category,
      image,
      description,
      clientName,
      projectUrl,
      featured,
      status,
    } = req.body;

    if (!title || !category || !image) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and image are required.",
      });
    }

    const slug = slugifyText(title);

    const existingProject = await Project.findOne({ slug });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "A project with this title already exists.",
      });
    }

    const project = await Project.create({
      title,
      slug,
      category,
      image,
      description,
      clientName,
      projectUrl,
      featured,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create project.",
    });
  }
}

export async function updateProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const updateData = { ...req.body };

    if (req.body.title && req.body.title !== project.title) {
      updateData.slug = slugifyText(req.body.title);

      const existingProject = await Project.findOne({
        slug: updateData.slug,
        _id: { $ne: req.params.id },
      });

      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: "Another project with this title already exists.",
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update project.",
    });
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete project.",
    });
  }
}