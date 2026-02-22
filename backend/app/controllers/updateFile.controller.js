const FileSystem = require("../models/FileSystem.model");
const fs = require("fs");
const path = require("path");

const updateFile = async (req, res) => {
  // #swagger.summary = 'Updates/replaces a file (e.g. after image edit).'
  /*
      #swagger.auto = false
      #swagger.consumes = ['multipart/form-data']
      #swagger.parameters['file'] = {
          in: 'formData',
          type: 'file',
          required: 'true',
      }
      #swagger.responses[200] = {
      schema: { $ref: '#/definitions/File' }
      }
      #swagger.responses[400]
      #swagger.responses[404]
      #swagger.responses[500]
  */
  try {
    const fileId = req.params.id;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file provided" });
    }

    const fileRecord = await FileSystem.findById(fileId);
    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    if (fileRecord.isDirectory) {
      return res.status(400).json({ error: "Cannot update a directory" });
    }

    const uploadsBase = path.join(__dirname, "../../public/uploads");
    const fullPath = path.join(uploadsBase, fileRecord.path);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      return res.status(500).json({ error: "Parent directory does not exist" });
    }

    await fs.promises.writeFile(fullPath, uploadedFile.buffer);

    fileRecord.size = uploadedFile.size;
    fileRecord.mimeType = uploadedFile.mimetype;
    await fileRecord.save();

    res.status(200).json(fileRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = updateFile;
