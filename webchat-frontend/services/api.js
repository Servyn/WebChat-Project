export const uploadMessage = async (image) => {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch("http://localhost:3001/api/message/upload", {
    method: "POST",
    body: formData,
  });

  return response.json();
};
