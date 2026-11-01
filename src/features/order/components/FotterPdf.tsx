import {
    Svg,
    Path,
    View,
    Text,
    Font,
    Circle
} from "@react-pdf/renderer";

import ethioFont from "@/assets/ethioFont.ttf";

Font.register({
    family: "ethio",
    src: ethioFont
});

// const RotaryPhoneIcon = () => {
//     return (
//         <Svg width="12" height="12" viewBox="0 0 24 24">
//             {/* Old telephone handset */}
//             <Path
//                 d="M7.2 3.2C6.4 2.5 5.2 2.5 4.5 3.3L3 5
//                 c-.5.7-.6 1.6-.2 2.4
//                 2.5 5.7 7.1 10.3 12.8 12.8
//                 .8.4 1.7.3 2.4-.2l1.7-1.5
//                 c.8-.7.8-1.9.1-2.7l-2.2-2.2
//                 c-.6-.6-1.5-.7-2.2-.3l-1.6.9
//                 c-1.9-1-3.5-2.6-4.5-4.5
//                 l.9-1.6c.4-.7.3-1.6-.3-2.2z"
//                 fill="none"
//                 stroke="#333333"
//                 strokeWidth="1.4"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//             />

//             {/* Rotary dial */}
//             <Path
//                 d="M7.5 5.8
//                 c2.9-2 6.8-1.3 8.8 1.6
//                 c1.1 1.6 1.4 3.5.9 5.3"
//                 fill="none"
//                 stroke="#333333"
//                 strokeWidth="1"
//                 strokeLinecap="round"
//             />

//             {/* Dial holes */}
//             <Path
//                 d="
//                     M10 6.2h.1
//                     M12.2 6.5h.1
//                     M14.1 7.7h.1
//                     M15.3 9.6h.1
//                     M15.4 11.8h.1
//                 "
//                 fill="none"
//                 stroke="#333333"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//             />
//         </Svg>



//     );
// };


const RotaryPhoneIcon = () => (
    <Svg width="13" height="13" viewBox="0 0 100 100">
        {/* Telephone Base */}
        <Path
            d="M 20 75 L 80 75 L 70 40 L 30 40 Z"
            fill="#2C3E50"
        />

        {/* Central Rotary Dial */}
        <Circle cx="50" cy="58" r="12" fill="#ECF0F1" />
        <Circle cx="50" cy="51" r="2" fill="#7F8C8D" />
        <Circle cx="56" cy="55" r="2" fill="#7F8C8D" />
        <Circle cx="54" cy="62" r="2" fill="#7F8C8D" />
        <Circle cx="46" cy="62" r="2" fill="#7F8C8D" />
        <Circle cx="44" cy="55" r="2" fill="#7F8C8D" />

        {/* Left and Right Cradle Prongs */}
        <Path d="M 32 40 L 35 30 L 41 30 L 39 40 Z" fill="#2C3E50" />
        <Path d="M 68 40 L 65 30 L 59 30 L 61 40 Z" fill="#2C3E50" />

        {/* Handset Handle */}
        <Path
            d="M 20 30 Q 50 18 80 30"
            fill="none"
            stroke="#34495E"
            strokeWidth="7"
            strokeLinecap="round"
        />

        {/* Handset Ear & Mouth Pieces */}
        <Circle cx="18" cy="31" r="7" fill="#2C3E50" />
        <Circle cx="82" cy="31" r="7" fill="#2C3E50" />
    </Svg>
);

const EmailIcon = () => {
    return (
        <Svg width="13" height="11" viewBox="0 0 24 24">
            <Path
                d="M3 5h18c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H3
                c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z"
                fill="none"
                stroke="#333333"
                strokeWidth="1.5"
            />

            <Path
                d="M2 7l10 6 10-6"
                fill="none"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

const FooterPdf = ({ fixed = false }) => {
    return (
        <View style={{ 
            width: "100%", 
            paddingHorizontal: 20,
            ...(fixed && {
                position: "absolute",
                bottom: 20,
                left: 0,
                right: 0
            })
        }}>

            {/* Horizontal Bar Component */}
            <View
                style={{
                    height: 2,
                    backgroundColor: "#333333",
                    width: "100%",
                    marginBottom: 5,
                    marginTop: 10
                }}
            />

            {/* Amharic Text Component */}
            <Text
                style={{
                    fontFamily: "ethio",
                    fontSize: 12,
                    fontWeight: "bold",
                    textAlign: "center",
                }}
            >
                ደረጃውን የጠበቀ ዕቃ ተሽከርካሪዎች በማስጠገንና ተገቢውን ዓመታዊ ምርመራ በወቅቱ በማስደረግ የትራፊክ አደጋ እንከላከል!!
            </Text>

            {/* Contact Information */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 5,
                    paddingHorizontal: 5,
                    // width:"600px",
                    marginLeft:20
                }}
            >

                {/* Phone 1 */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <RotaryPhoneIcon />

                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            marginLeft: 4,

                        }}
                    >
                        +251-468932072
                    </Text>
                </View>

                {/* Phone 2 */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <RotaryPhoneIcon />

                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            marginLeft: 4,
                        }}
                    >
                        +251-911-649472
                    </Text>
                </View>

                {/* Email */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <EmailIcon />

                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            marginLeft: 4,
                        }}
                    >
                        68
                    </Text>
                </View>

                {/* Location */}
                <Text
                    style={{
                        fontFamily: "ethio",
                        fontSize: 10,
                        fontWeight: "bold",
                        marginRight:10
                    }}
                >
                    ወላይታ ሶዶ-ኢትዮጵያ
                </Text>

            </View>

            {/* Keep your original empty space */}
            <View>
                <Text></Text>
            </View>

        </View>
    );
};

export default FooterPdf;