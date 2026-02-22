import { api } from "./api";

export const updateFileAPI = async (fileId, blob, fileName) => {
  try {
    const formData = new FormData()
    formData.append("file", blob, fileName)
    const response = await api.put(`/update/${fileId}`, formData)
    return response
  } catch (error) {
    return error
  }
}
