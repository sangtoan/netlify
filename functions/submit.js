const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const form = new IncomingForm();
  form.uploadDir = '/tmp';
  form.keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(event, (err, fields, files) => {
      if (err) {
        return reject({
          statusCode: 500,
          body: JSON.stringify({ error: err.message })
        });
      }

      // Đọc file submissions.json hiện có
      const submissionsFilePath = path.join(__dirname, '../public/submissions.json');
      const submissions = JSON.parse(fs.readFileSync(submissionsFilePath, 'utf-8'));

      // Tạo một mục nhập mới
      const newSubmission = {
        id: submissions.length + 1,
        author: fields.author,
        email: fields.email,
        title: fields.title,
        description: fields.description,
        code: fields['tikz-code'],
        image: `submissions/images/${path.basename(files.image.path)}`,
        group: fields.group,
        newGroup: fields['new-group']
      };

      submissions.push(newSubmission);

      // Lưu hình ảnh vào thư mục public/submissions/images
      const destImagePath = path.join(__dirname, '../public/submissions/images', path.basename(files.image.path));
      fs.renameSync(files.image.path, destImagePath);

      // Cập nhật submissions.json
      fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));

      resolve({
        statusCode: 200,
        body: JSON.stringify({ success: true })
      });
    });
  });
};
