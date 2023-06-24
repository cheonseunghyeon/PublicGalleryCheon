import firestore from '@react-native-firebase/firestore';

const postsCollection = firestore().collection('posts');

// user - UserContext에 담긴 현재 사용자의 정보
// photoURL - 업로드할 이미지 주소
// description - 이미지에 대한 설명 텍스트
// createdAt - 고유 식별값
export function createPost({user, photoURL, description}) {
  return postsCollection.add({
    user,
    photoURL,
    description,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

export const PAGE_SIZE = 3;

// // get 함수 호출 시 QuerySnapshot 객체가 반환 - 요청 정보에 대하 결과 저장
// // QuerySnapshot 객체 내부에 docs라는 배열이 있고, 이 배열 안에 각 문서에 대한 정보 기록, 없으면 빈 배열
// export async function getPosts(userId) {
//   let query = postsCollection.orderBy('createdAt', 'desc').limit(PAGE_SIZE);
//   if (userId) {
//     query = query.where('user.id', '==', userId);
//   }
//   const snapshot = await query.get();

//   // 별도의 고유 id가 없어서 map 함수로 id 넣어줌
//   const posts = snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//   }));

//   return posts;
// }

// // 특정 아이디를 받은 후 그것 보다 이전에 작성한 것을 가져옴
// export async function getOlderPosts(id, userId) {
//   const cursorDoc = await postsCollection.doc(id).get();
//   let query = postsCollection
//     .orderBy('createdAt', 'desc')
//     // 문서를 넣으면 해당 문서 다음의 데이터가 반환
//     // 숫자를 넣으면 조회할 결과의 n번째 문서 이후의 데이터 반환
//     .startAfter(cursorDoc)
//     .limit(PAGE_SIZE);
//   if (userId) {
//     query = query.where('user.id', '==', userId);
//   }
//   const snapshot = await query.get();

//   const posts = snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//   }));

//   return posts;
// }
// export async function getNewerPosts(id, userId) {
//   const cursorDoc = await postsCollection.doc(id).get();
//   let query = postsCollection
//     .orderBy('createdAt', 'desc')
//     .endBefore(cursorDoc)
//     .limit(PAGE_SIZE);
//   if (userId) {
//     query = query.where('user.id', '==', userId);
//   }
//   const snapshot = await query.get();

//   const posts = snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data(),
//   }));

//   return posts;
// }

//리팩토링 방법
export async function getPosts({userId, mode, id} = {}) {
  let query = postsCollection.orderBy('createdAt', 'desc').limit(PAGE_SIZE);
  if (userId) {
    query = query.where('user.id', '==', userId);
  }
  if (id) {
    const cursorDoc = await postsCollection.doc(id).get();
    query =
      mode === 'older'
        ? query.startAfter(cursorDoc)
        : query.endBefore(cursorDoc);
  }

  const snapshot = await query.get();

  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return posts;
}

export async function getOlderPosts(id, userId) {
  return getPosts({
    id,
    mode: 'older',
    userId,
  });
}

export async function getNewerPosts(id, userId) {
  return getPosts({
    id,
    mode: 'newer',
    userId,
  });
}
