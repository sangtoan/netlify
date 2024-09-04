const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const { id } = JSON.parse(event.body);

  // Đọc file submissions.json hiện có
  const submissionsFilePath = path.join(__dirname, '../public/submissions.json');
  const submissions = JSON.parse(fs.readFileSync(submissionsFilePath, 'utf-8'));

  // Tìm submission cần phê duyệt
  const submissionIndex = submissions.findIndex(sub => sub.id === id);
  if (submissionIndex === -1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Submission not found' })
    };
  }

  const submission = submissions[submissionIndex];

  // Đọc file data.json hiện có
  const dataFilePath = path.join(__dirname, '../public/data.json');
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

  // Tạo một mục nhập mới
  const newEntry = {
    id: data.groups.reduce((maxId, group) => Math.max(maxId, ...group.items.map(item => item.id)), 0) + 1,
    author: submission.author,
    email: submission.email,
    title: submission.title,
    description: submission.description,
    code: submission.code,
    image: `images/${path.basename(submission.image)}`
  };

  // Tìm hoặc tạo nhóm
  let group = data.groups.find(g => g.name === submission.group || g.name === submission.newGroup);
  if (!group) {
    group = { name: submission.newGroup || submission.group, items: [] };
    data.groups.push(group);
  }
  group.items.push(newEntry);

  // Lưu hình ảnh vào thư mục public/images
  const srcImagePath = path.join(__dirname, '../public/submissions/images', path.basename(submission.image));
  const destImagePath = path.join(__dirname, '../public/images', path.basename(submission.image));
  fs.renameSync(srcImagePath, destImagePath);

  // Cập nhật data.json
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

  // Xóa submission đã được phê duyệt khỏi submissions.json
  submissions.splice(submissionIndex, 1);
  fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
