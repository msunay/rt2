import type {
  HostVideoStreamState,
  HostVideoStreamStateAction,
} from '@/reducers/hostVideoStreamStateReducer';
import { SpeedDial } from '@rneui/themed';
import type { Dispatch } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SpeedDialComponent({
  getLocalStream,
  stream,
  endStream,
  state,
  dispatchState,
}: {
  getLocalStream: () => void;
  stream: () => void;
  endStream: () => void;
  state: HostVideoStreamState;
  dispatchState: Dispatch<HostVideoStreamStateAction>;
}) {

  return (
    <SpeedDial
      style={{ position: 'absolute' }}
      isOpen={state.actionBtnOpen}
      icon={{ name: 'menu', color: '#fff' }}
      openIcon={{ name: 'close', color: '#fff' }}
      onOpen={() =>
        dispatchState({ type: 'TOGGLE_HVS_ACTION_BTN_OPEN', payload: undefined })
      }
      onClose={() =>
        dispatchState({ type: 'TOGGLE_HVS_ACTION_BTN_OPEN', payload: undefined })
      }
      overlayColor='rgba(0, 0, 0, 0.3)'
      iconContainerStyle={{ backgroundColor: '#FF7F50' }}
    >
      <SpeedDial.Action
        icon={{ name: 'flip-camera-ios', color: '#fff' }}
        title='Flip Camera'
        color='#FF7F50'
        style={styles.speedDialActions}
        onPress={() => {
          state.mediaStream?.getVideoTracks()[0]._switchCamera();
          dispatchState({ type: 'TOGGLE_HVS_ACTION_BTN_OPEN', payload: undefined });
          setTimeout(() => {
            dispatchState({ type: 'TOGGLE_HVS_FRONT_FACING', payload: undefined });
          }, 300);
        }}
      />
      <SpeedDial.Action
        icon={{ name: 'videocam', color: '#fff' }}
        title='Start Camera'
        color='#FF7F50'
        style={styles.speedDialActions}
        onPress={() => {
          getLocalStream();
          dispatchState({ type: 'TOGGLE_HVS_ACTION_BTN_OPEN', payload: undefined });
        }}
      />
      <SpeedDial.Action
        icon={{ name: 'record-rec', type: 'material-community', color: '#fff' }}
        title='Start Streaming'
        color='#FF7F50'
        onPress={() => {
          stream();
          dispatchState({ type: 'TOGGLE_HVS_ACTION_BTN_OPEN', payload: undefined });
        }}
      />
      <SpeedDial.Action
        icon={{ name: 'stop', type: 'octicon', color: '#fff' }}
        title='End Stream'
        color='#FF7F50'
        onPress={() => {
          endStream();
          dispatchState({ type: 'TOGGLE_HVS_ACTION_BTN_OPEN', payload: undefined });
        }}
      />
    </SpeedDial>
  );
}

const styles = StyleSheet.create({
  speedDialActions: {
    // borderRadius: 50,
  },
});
