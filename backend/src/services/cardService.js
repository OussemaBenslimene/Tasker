import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { StatusCodes } from 'http-status-codes'
import { validateCardOwners } from '~/utils/helperMethods'
import { ObjectId } from 'mongodb'
import axios from 'axios'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) {
    throw error
  }
}

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}

    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else if (updateData.commentToAdd) {
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      updatedCard = await cardModel.updateMembers(cardId, updateData.incomingMemberInfo)
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) { throw error }
}

const deleteItem = async (cardId) => {
  try {
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
    }

    await cardModel.deleteItem(cardId)

    await columnModel.pullCardOrderIds(targetCard)

    return true
  } catch (error) { throw error }
}


const createChecklist = async (user, cardId, title) => {
  try {
    const newChecklist = { title, items: [] };

    const cardIdObj = new ObjectId(cardId);
    const card = await cardModel.findOneById(cardIdObj);
    const columnIdObj = new ObjectId(card.columnId);
    await columnModel.findOneById(columnIdObj);
    const boardIdObj = new ObjectId(card.boardId);
    await boardModel.findOneById(boardIdObj);

    const validateOwner = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);

    if (!validateOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to create checklist!');
    }

    const updatedCard = await cardModel.createChecklist(cardId, newChecklist);

    return updatedCard;
  } catch (error) {
    throw error;
  }
}

const addChecklistItem = async (user, cardId, checklistId, text) => {
  try {
    const cardIdObj = new ObjectId(cardId);
    const checklistIdObj = new ObjectId(checklistId);

    const card = await cardModel.findOneById(cardIdObj);
    const columnIdObj = new ObjectId(card.columnId);
    await columnModel.findOneById(columnIdObj);
    const boardIdObj = new ObjectId(card.boardId);
    await boardModel.findOneById(boardIdObj);

    const validateOwner = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);

    if (!validateOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to add checklist item!');
    }

    const newChecklistItem = {
      id: new ObjectId(),
      text,
      completed: false,
      createdAt: Date.now(),
      createdBy: user._id
    };

    const updatedCard = await cardModel.addChecklistItem(cardIdObj, checklistIdObj, newChecklistItem);

    return updatedCard;
  } catch (error) {
    throw error;
  }
};

const updateChecklist = async (user, cardId, checklistId, title) => {
  try {
    const cardIdObj = new ObjectId(cardId);
    const checklistIdObj = new ObjectId(checklistId);
    const userIdObj = new ObjectId(user._id);

    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);

    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update checklist item!');
    }

    const updatedCard = await cardModel.updateChecklist(cardIdObj, checklistIdObj, title);

    return updatedCard;

  } catch (error) {
    throw error;
  }
};

const deleteChecklist = async (user, cardId, checklistId) => {
  try {
    const cardIdObj = new ObjectId(cardId);
    const checklistIdObj = new ObjectId(checklistId);

    const card = await cardModel.findOneById(cardIdObj);
    const columnIdObj = new ObjectId(card.columnId);
    await columnModel.findOneById(columnIdObj);
    const boardIdObj = new ObjectId(card.boardId);
    await boardModel.findOneById(boardIdObj);

    const validateOwner = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);

    if (!validateOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to delete checklist item!');
    }

    const updatedCard = await cardModel.deleteChecklist(cardIdObj, checklistIdObj);
    return updatedCard;

  } catch (error) {
    throw error;
  }
};

const setChecklistItemCompleted = async (user, cardId, checklistId, checklistItemId, completed) => {
  try {
    const cardIdObj = new ObjectId(cardId);
    const checklistIdObj = new ObjectId(checklistId);
    const checklistItemIdObj = new ObjectId(checklistItemId);

    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }

    // Check user permissions to modify the checklist item
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);

    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to modify this checklist item!');
    }

    // Call the model method to update the checklist item completion status
    const updatedCard = await cardModel.setChecklistItemCompleted(
      cardIdObj,
      checklistIdObj,
      checklistItemIdObj,
      completed
    );

    return updatedCard;
  } catch (error) {
    throw error;
  }
};

const setChecklistItemText = async (user, cardId, checklistId, checklistItemId, text) => {
  try {
    // Convert the IDs to ObjectId instances
    const cardIdObj = new ObjectId(cardId);
    const checklistIdObj = new ObjectId(checklistId);
    const checklistItemIdObj = new ObjectId(checklistItemId);

    // Get the card to ensure it's valid and retrieve related data (e.g., columnId, boardId)
    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }

    // Check user permissions to modify the checklist item
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);

    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to modify this checklist item!');
    }
    // Call the model method to update the checklist item text
    const updatedCard = await cardModel.setChecklistItemText(cardIdObj, checklistIdObj, checklistItemIdObj, text);
    return updatedCard;
  }
  catch (error) {
    throw error;
  }
}

const deleteChecklistItem = async (user, cardId, checklistId, checklistItemId) => {
  try {
    // Convert the IDs to ObjectId instances
    const cardIdObj = new ObjectId(cardId);
    const checklistIdObj = new ObjectId(checklistId);
    const checklistItemIdObj = new ObjectId(checklistItemId);

    // Get the card to ensure it's valid and retrieve related data (e.g., columnId, boardId)
    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }

    // Check user permissions to modify the checklist item
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);

    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to modify this checklist item!');
    }

    // Call the model method to delete the checklist item
    const updatedCard = await cardModel.deleteChecklistItem(cardIdObj, checklistIdObj, checklistItemIdObj);
    return updatedCard;

  } catch (error) {
    throw error
  }
}

const addAttachment = async (user, cardId, attachment) => {
  try {
    // Convert the IDs to ObjectId instances
    const cardIdObj = new ObjectId(cardId);

    // Get the card to ensure it's valid and retrieve related data (e.g., columnId)
    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }

    // Check user permissions to add attachment
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);
    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to add attachment!');
    }

    // Validate and normalize the link
    const validLink = new RegExp(/^https?:\/\//).test(attachment.link) ? attachment.link : `http://${attachment.link}`;

    // Check if the link is accessible
    try {
      await axios.head(validLink, { timeout: 5000 }); // 5-second timeout for the request
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Provided link is not accessible!');
    }

    // Add attachment
    const newAttachment = {
      link: validLink,
      name: attachment.name,
    };

    const updatedCard = await cardModel.addAttachment(cardIdObj, newAttachment);
    return updatedCard;
  } catch (error) {
    throw error;
  }
};

const updateAttachmentName = async (user, cardId, attachmentId, name) => {
  try {
    // Convert the IDs to ObjectId instances
    const cardIdObj = new ObjectId(cardId);
    const attachmentIdObj = new ObjectId(attachmentId);
    // Get the card to ensure it's valid and retrieve related data (e.g., columnId
    const card = await cardModel.findOneById(cardIdObj);

    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }
    // Check user permissions to update attachment
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);
    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update attachment!');
    }
    // Update attachment name
    const updatedAttachment = await cardModel.updateAttachmentName(cardIdObj, attachmentIdObj, name);
    return updatedAttachment;
  }
  catch (error) {
    throw error;
  }
}

const updateAttachmentLink = async (user, cardId, attachmentId, link) => {
  try {
    // Convert the IDs to ObjectId instances
    const cardIdObj = new ObjectId(cardId);
    const attachmentIdObj = new ObjectId(attachmentId);
    // Get the card to ensure it's valid and retrieve related data (e.g., columnId
    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }
    // Check user permissions to update attachment
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);
    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to update attachment!');
    }

    // Validate and normalize the link
    const validLink = new RegExp(/^https?:\/\//).test(link) ? link : `http://${link}`;

    // Check if the link is accessible
    try {
      await axios.head(validLink, { timeout: 5000 }); // 5-second timeout for the request
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Provided link is not accessible!');
    }

    // Update attachment link
    const updatedAttachment = await cardModel.updateAttachmentLink(cardIdObj, attachmentIdObj, validLink);
    return updatedAttachment;
  }
  catch (error) {
    throw error;
  }
}

const removeAttachment = async (user, cardId, attachmentId) => {
  try {
    const cardIdObj = new ObjectId(cardId);
    const attachmentIdObj = new ObjectId(attachmentId);
    const card = await cardModel.findOneById(cardIdObj);
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!');
    }
    const columnIdObj = new ObjectId(card.columnId);
    const boardIdObj = new ObjectId(card.boardId);
    const isOwnerValid = await validateCardOwners(cardIdObj, columnIdObj, boardIdObj, user);
    if (!isOwnerValid) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to remove attachment!');
    }
    const removedAttachment = await cardModel.removeAttachment(cardIdObj, attachmentIdObj);
    return removedAttachment;
  }
  catch (error) {
    throw error;
  }
}

export const cardService = {
  createNew,
  update,
  deleteItem,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  addChecklistItem,
  setChecklistItemCompleted,
  setChecklistItemText,
  deleteChecklistItem,
  addAttachment,
  updateAttachmentName,
  updateAttachmentLink,
  removeAttachment
}
