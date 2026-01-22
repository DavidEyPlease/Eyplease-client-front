import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import useAuth from "@/hooks/useAuth"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import FormEditProfile from "./components/FormEditProfile"
import ProfilePhoto from "./components/ProfilePhoto"
import Logotype from "./components/Logotype"
import ChangePassword from "./components/ChangePassword"
// import { IconReceipt } from "@/components/Svg/IconReceipt"
import { IconLock } from "@/components/Svg/IconLock"
import { IconHelpCenter } from "@/components/Svg/IconHelpCenter"
import Faqs from "./components/Faq"
import Preferences from "./components/Preferences"
import { IconPreferences } from "@/components/Svg/IconPreferences"
import PageTitle from "@/components/generics/PageTitle"

const ProfilePage = () => {
    const [openEdit, setOpenEdit] = useState(false)
    const { user } = useAuth()

    return (
        <div className="grid space-y-5">
            <Card className="p-0">
                <PageTitle className="rounded-none rounded-tr-xl rounded-tl-xl">
                    <h1 className="text-3xl font-semibold">
                        Perfil
                    </h1>
                </PageTitle>
                {/* <CardHeader className="rounded-tr-xl rounded-tl-xl pt-0 bg-gradient-to-tr from-[#231f56] via-[#3d0a6e] to-[#f0047f] h-40" /> */}
                <CardContent>
                    <div className="flex items-center space-x-4">
                        {user && <ProfilePhoto authUser={user} />}
                        <div className="flex items-center justify-between flex-1 pt-2">
                            <div className="flex flex-col justify-end space-y-1">
                                <p className="text-2xl">{user?.name}</p>
                                {user && <Logotype user={user} />}
                            </div>
                            <Button
                                text='Editar perfil'
                                type="submit"
                                color="primary"
                                variant="outline"
                                rounded
                                onClick={() => setOpenEdit(true)}
                            />
                            <Modal open={openEdit} onOpenChange={setOpenEdit} title="Editar perfil">
                                {user && <FormEditProfile user={user} onSuccess={() => setOpenEdit(false)} />}
                            </Modal>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Tabs defaultValue="user_preferences" className="w-full">
                <TabsList>
                    <TabsTrigger value="user_preferences">
                        <div className="flex items-center gap-x-2">
                            <IconPreferences />
                            Preferencias
                        </div>
                    </TabsTrigger>
                    {/* <TabsTrigger value="payments">
                        <div className="flex items-center gap-x-2">
                            <IconReceipt />
                            Pagos y facturas
                        </div>
                    </TabsTrigger> */}
                    <TabsTrigger value="change_password">
                        <div className="flex items-center gap-x-2">
                            <IconLock />
                            Seguridad
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="help_center">
                        <div className="flex items-center gap-x-2">
                            <IconHelpCenter />
                            Centro de ayuda
                        </div>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="user_preferences">
                    {user && <Preferences user={user} />}
                </TabsContent>
                <TabsContent value="payments">Pagos y facturas</TabsContent>
                <TabsContent value="change_password">
                    <ChangePassword />
                </TabsContent>
                <TabsContent value="help_center">
                    <Faqs />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProfilePage