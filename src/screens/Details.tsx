import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { useRoute } from '@react-navigation/native'
import { HStack, ScrollView, Text, useTheme, VStack } from 'native-base'
import { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore'
import {
  CircleWavyCheck,
  Hourglass,
  DesktopTower,
  Clipboard,
} from 'phosphor-react-native'

import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { CardDetails } from '../components/CardDetails'
import { OrderProps } from '../components/Order'

import { dateFormat } from '../utils/firestoreDateFormat'
import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO'
import { Input } from '../components/Input'
import { Button } from '../components/Button'

type RouteParams = {
  orderId: string
}

type OrderDetails = OrderProps & {
  description: string
  solution: string
  closedAt: string
}

export function Details() {
  const route = useRoute()
  const { colors } = useTheme()

  const { orderId } = route.params as RouteParams

  const [isLoading, setIsLoading] = useState(true)
  const [solution, setSolution] = useState('')
  const [order, setOrder] = useState<OrderDetails>({} as OrderDetails)

  useEffect(() => {
    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .get()
      .then((doc) => {
        const {
          patrimony,
          description,
          status,
          createdAt,
          solution,
          closedAt,
        } = doc.data()

        const closed = closedAt ? dateFormat(closedAt) : null

        setOrder({
          id: doc.id,
          patrimony,
          description,
          status,
          solution,
          when: dateFormat(createdAt),
          closedAt: closed,
        })

        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bg="gray.700">
      <Header title="Solicitação" />

      <HStack bg="gray.500" justifyContent="center" p={4}>
        {order.status === 'closed' ? (
          <CircleWavyCheck size={22} color={colors.green[300]} />
        ) : (
          <Hourglass size={22} color={colors.secondary[700]} />
        )}

        <Text
          fontSize="sm"
          color={
            order.status === 'closed'
              ? colors.green[300]
              : colors.secondary[700]
          }
          ml={2}
          textTransform="uppercase"
        >
          {order.status === 'closed' ? 'Finalizado' : 'Em andamento'}
        </Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <CardDetails
          title="Equipamentos"
          description={`Patrimônio ${order.patrimony}`}
          icon={DesktopTower}
          footer={order.when}
        />

        <CardDetails
          title="Descrição do problema"
          description={order.description}
          icon={Clipboard}
        />

        <CardDetails
          title="Solução"
          icon={CircleWavyCheck}
          footer={order.closedAt && `Encerrado em ${order.closedAt}`}
        >
          <Input
            placeholder="Descrição da solução"
            onChangeText={setSolution}
            h={24}
            textAlignVertical="top"
            multiline
          />
        </CardDetails>
      </ScrollView>

      {!order.closedAt && <Button title="Encerrar solicitação" m={5} />}
    </VStack>
  )
}
