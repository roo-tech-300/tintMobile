import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@/theme/theme'
import { useAuth } from '@/context/AuthContext'

const Settings = () => {
  const { logout } = useAuth()
  return (
    <SafeAreaView>
      <Pressable style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 10, margin: 10, width: "100%", justifyContent: "center", alignItems: "center" }} onPress={() => logout()}>
        <Text style={{ color: colors.text }}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default Settings