import mongoose from "mongoose";
import { connect } from "../db";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Group } from "../models/Group";
import { FriendShipRequest } from "../models/FriendShipRequest";
import { userList } from "./userData";
import { postList } from "./postData";
import { groupList } from "./groupData";
import { friendShipRequestList } from "./FriendShipRequestData";
import { generateRandom } from "../utils/utils";

const seedRelations = async () => {
  try {
    await connect();
    console.log("Conexión establecida con la base de datos");

    // Borramos datos
    await User.collection.drop();
    await Post.collection.drop();
    await Group.collection.drop();
    await FriendShipRequest.collection.drop();
    console.log("Todos los datos eliminados");

    // Creamos usuarios
    const users = await User.create(userList);

    // Creamos publicaciones
    const posts = await Post.create(postList.map(post => ({ ...post, user: users[0]._id })));

    // Asignamos publicaciones a usuarios
    for (let i = 0; i < posts.length; i++) {
      const randomUserIndex = generateRandom(0, users.length);
      const randomUser = users[randomUserIndex];
      posts[i].user = randomUser.id;
      await posts[i].save();
    }

    // Creamos grupos
    const groups = await Group.create(groupList.map(group => ({ ...group, admin: users[0]._id })));

    // Asignamos usuarios a grupos y admin a grupos
    for (let i = 0; i < groups.length; i++) {
      const randomUserIndexAdmin = generateRandom(0, users.length);
      const randomUserIndexMember = generateRandom(0, users.length);
      const randomUserAdmin = users[randomUserIndexAdmin];
      const randomUserMember = users[randomUserIndexMember];
      groups[i].admin = randomUserAdmin.id;
      groups[i].members.push(randomUserMember.id);
      await groups[i].save();
    }

    // Creamos solicitudes de amistad
    const friendRequests = [];
    for (let i = 0; i < friendShipRequestList.length; i++) {
      let randomSenderIndex, randomRecipientIndex;
      do {
        randomSenderIndex = generateRandom(0, users.length);
        randomRecipientIndex = generateRandom(0, users.length);
      } while (randomSenderIndex === randomRecipientIndex); // Aseguramos que el sender y el recipient no sean el mismo usuario

      const randomSender = users[randomSenderIndex];
      const randomRecipient = users[randomRecipientIndex];
      const friendRequest = new FriendShipRequest({
        ...friendShipRequestList[i],
        sender: randomSender.id,
        recipient: randomRecipient.id
      });
      await friendRequest.save();
      friendRequests.push(friendRequest);
    }

    console.log("Relaciones creadas exitosamente");
  } catch (error) {
    console.error("Error al conectar con la base de datos");
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

seedRelations();
