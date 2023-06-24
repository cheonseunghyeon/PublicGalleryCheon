import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';

import {
  Image,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
// 이미지 가져오기
import {launchImageLibrary} from 'react-native-image-picker';
// firebase에 저장
import storage from '@react-native-firebase/storage';
import {signOut} from '../lib/auth';
import {createUser} from '../lib/users';
import BorderedInput from './BorderedInput';
import CustomButton from './CustomButton';
import {useUserContext} from '../contexts/UserContext';
import Avatar from './Avatar';

function SetupProfile() {
  const [displayName, setDisplayName] = useState('');
  const navigation = useNavigation();
  // 유저 정보 조회
  const {setUser} = useUserContext();
  // 이미지 uri 관리
  const [response, setResponse] = useState(null);
  const {params} = useRoute();

  const [loading, setLoading] = useState(false);
  const {uid} = params || {};

  const onSubmit = async () => {
    setLoading(true);

    let photoURL = null;

    if (response) {
      const asset = response.assets[0];
      const extension = asset.fileName.split('.').pop(); // 확장자 추출
      const reference = storage().ref(`/profile/${uid}.${extension}`);

      if (Platform.OS === 'android') {
        //안드로이드의 경우 base64로 인코딩된 데이터를 업로드
        await reference.putString(asset.base64, 'base64', {
          contentType: asset.type,
        });
      } else {
        await reference.putFile(asset.uri);
      }

      photoURL = response ? await reference.getDownloadURL() : null;
    }
    // 프로필 정보
    const user = {
      id: uid,
      displayName,
      photoURL,
    };
    // 정보에 따라 프로필 생성 후 조회
    createUser(user);
    setUser(user);
    console.log(user);
  };
  const onCancel = () => {
    signOut();
    navigation.goBack();
  };
  const onSelectImage = () => {
    // callback 함수 - 이미지 호출
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        // 안드로이드일 경우  includeBase64가 true - uri 권한 오류 발생 위험
        includeBase64: Platform.OS === 'android',
      },
      res => {
        if (res.didCancel) {
          // 취소했을 경우
          return;
        }
        setResponse(res);
      },
    );
  };
  return (
    <View style={styles.block}>
      <Pressable onPress={onSelectImage}>
        <Avatar source={response && {uri: response.uri}} size={128} />
      </Pressable>
      <View style={styles.form}>
        <BorderedInput
          placeholder="닉네임"
          value={displayName}
          onChangeText={setDisplayName}
          onSubmitEditing={onSubmit}
          returnKeyType="next"
        />
        {/* 로딩 중이라면 버튼 대신 회전 연출 */}
        {loading ? (
          <ActivityIndicator size={32} color="#6200ee" style={styles.spinner} />
        ) : (
          <View style={styles.buttons}>
            <CustomButton title="다음" onPress={onSubmit} hasMarginBottom />
            <CustomButton title="취소" onPress={onCancel} theme="secondary" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  circle: {
    backgroundColor: '#cdcdcd',
    borderRadius: 64,
    width: 128,
    height: 128,
  },
  form: {
    marginTop: 16,
    width: '100%',
  },
  buttons: {
    marginTop: 48,
  },
});

export default SetupProfile;
