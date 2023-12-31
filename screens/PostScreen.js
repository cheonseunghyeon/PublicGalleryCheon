import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import PostCard from '../components/PostCard';
import events from '../lib/events';

function PostScreen() {
  const route = useRoute();
  // post 객체를 라우트 파라미터로 받아온다.

  const navigation = useNavigation();
  const {post} = route.params;
  useEffect(() => {
    const handler = ({description}) => {
      navigation.setParams({post: {...post, description}});
    };
    events.addListener('updatePost', handler);
    return () => {
      events.removeListener('updatePost', handler);
    };
  }, [post, navigation]);
  return (
    // PostCard를 스크롤 방식으로 보여줌
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <PostCard
        user={post.user}
        photoURL={post.photoURL}
        description={post.description}
        createdAt={post.createdAt}
        id={post.id}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: {flex: 1},
  contentContainer: {
    paddingBottom: 40,
  },
});

export default PostScreen;
