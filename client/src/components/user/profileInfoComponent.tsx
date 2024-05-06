import { useAppSelector } from '@/hooks/reduxHooks';
import { inputDisabledStyle } from '@/utils/helpers';
import { AntDesign, Feather, Fontisto } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { object, ref, string } from 'yup';

export default function ProfileInfoComponent() {
  const userDetails = useAppSelector(state => state.userSlice);

  const passwordFieldRef = useRef<TextInput>(null);
  const repeatPasswordFieldRef = useRef<TextInput>(null);

  const [disabled, setDisabled] = useState(true);
  const [formInputStyles, setFormInputStyles] = useState<
    {
      [key: string]: string | number;
    }[]
  >([styles.formItem]);

  const [formControlsStyle, setFormControlStyle] = useState<
    {
      [key: string]: string | number;
    }[]
  >([styles.formControls, { opacity: 0 }]);

  useEffect(() => {
    if (passwordFieldRef.current?.isFocused) {
      repeatPasswordFieldRef.current;
    }
  }, []);

  const userDataSchema = object().shape({
    email: string().email('Not a valid email address'),
    password: string().min(8, 'Password must contain at least 8 characters'),
    repeatPassword: string().oneOf([ref('password')], 'Passwords must match'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userDataSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: '',
    },
  });

  const inputStyle = (pressed: boolean) =>
    inputDisabledStyle(pressed, ['#c4c4c4', '#FFFFFF'], styles.formItem);

  // Function to dynamically adjust Pressable component style based on press state.
  const pressableStyle = ({ pressed }: { pressed: boolean }) => {
    return pressed
      ? {
          ...styles.loginBtn,
          backgroundColor: '#ffb296',
        }
      : {
          ...styles.loginBtn,
          backgroundColor: '#FF7F50',
        };
  };

  const editUserData = () => {
    const mergedStyles = Object.assign({}, ...inputStyle(false));

    setDisabled(false);
    setFormInputStyles(mergedStyles);
    setFormControlStyle([styles.formControls]);
  };

  const cancelEdit = () => {
    const mergedStyles = Object.assign({}, ...inputStyle(false));

    setDisabled(true);
    setFormInputStyles(mergedStyles);
    setFormControlStyle([styles.formControls, { opacity: 0 }]);
  };

  return (
    <View style={styles.details}>
      <View style={styles.titleContainer}>
        <Text style={styles.personalInfoTitle}>Personal Information</Text>
        <Pressable style={styles.editBtn} onPress={editUserData}>
          <AntDesign name='edit' size={14} color='#25CED1' />
          <Text style={[{ marginLeft: 5, color: '#25CED1' }, styles.personalInfoTitle]}>
            Edit
          </Text>
        </Pressable>
      </View>
      <View style={styles.formContainer}>
        <View
          style={[{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }, formInputStyles]}
        >
          <View style={styles.formItemLeft}>
            <Fontisto name='email' size={18} color='#25CED1' />
            <Text style={styles.formItemTitle}>Email</Text>
          </View>
          <Controller
            name='email'
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.textInput}
                keyboardType='email-address'
                placeholder={userDetails.email}
                editable={!disabled}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        {/* <View style={styles.formItem}>
              <View style={styles.formItemLeft}>
                <MaterialIcons
                  name="alternate-email"
                  size={18}
                  color="#25CED1"
                />
                <Text style={styles.formItemTitle}>Username</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder={userDetails.username}
              />
            </View>
            <View style={styles.formItem}>
              <View style={[{ paddingLeft: 0 }, styles.formItemLeft]}>
                <Ionicons name="location-outline" size={18} color="#25CED1" />
                <Text style={styles.formItemTitle}>Location</Text>
              </View>
              <TextInput style={styles.textInput} placeholder="London" />
            </View> */}
        <View
          style={[
            { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
            formInputStyles,
          ]}
        >
          <View style={styles.formItemLeft}>
            <Feather name='lock' size={18} color='#25CED1' />
            <Text style={styles.formItemTitle}>Password</Text>
          </View>
          <Controller
            name='password'
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                ref={passwordFieldRef}
                style={styles.textInput}
                secureTextEntry
                placeholder='**********'
                editable={!disabled}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
        <View
          style={[
            { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
            formInputStyles,
            styles.hidden,
          ]}
        >
          <View style={styles.formItemLeft}>
            <Feather name='lock' size={18} color='#25CED1' />
            <Text style={styles.formItemTitle}>Repeat Password</Text>
          </View>
          <Controller
            name='repeatPassword'
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                ref={repeatPasswordFieldRef}
                style={styles.textInput}
                secureTextEntry
                placeholder='**********'
                editable={!disabled}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>
      </View>
      <View style={formControlsStyle}>
        <Pressable
          onPress={cancelEdit}
          style={[styles.loginBtn, { backgroundColor: 'white' }]}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </Pressable>
        <Pressable style={pressableStyle}>
          <Text style={styles.btnText}>Confirm</Text>
        </Pressable>
      </View>
      <View style={styles.listFooter} />
    </View>
  );
}

const styles = StyleSheet.create({
  details: {
    flex: 2,
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    height: 30,
    justifyContent: 'space-between',
    // borderColor: "#FF0000",
    // borderWidth: 1,
  },
  personalInfoTitle: {
    fontFamily: 'Nunito-SemiBold',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    // flex: 1,
    // borderColor: "#FF0000",
    // borderWidth: 1,
    flexShrink: 1,
  },
  formItem: {
    backgroundColor: '#c4c4c4',
    height: 50,
    marginBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formItemTitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    marginLeft: 5,
  },
  formItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  formControls: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  hidden: {
    display: 'none',
  },
  listFooter: {
    height: 100,
  },
  btnText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
  },
  loginBtn: {
    justifyContent: 'center',
    alignContent: 'center',
    height: 50,
    borderRadius: 10,
    marginTop: 10,
    flex: 1,
  },
});
