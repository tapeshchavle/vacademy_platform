// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Preferences } from "@capacitor/preferences";
// import { fetchDataByIds } from "@/services/GetDataById";
// import { GET_TEXT_VIA_IDS } from "@/constants/urls";
// // import { fetchDataByIds } from "@/lib/api"; // Adjust import path as needed

// export function ExpandableParagraph() {
//   const [aboutData, setAboutData] = useState(null);
//   const [expanded, setExpanded] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAboutData = async () => {
//       try {
//         setLoading(true);
//         // Get the stored IDs
//         const storedIds = await Preferences.get({
//           key: "InstructionID_and_AboutID"
//         });

//         if (storedIds.value) {
//           const parsedData = JSON.parse(storedIds.value);
          
//           // Check if about_id exists and is not null
//           parsedData.about_id = "e54b40ca-01c6-4bce-86f9-b59ee9cf494d"
//           if (parsedData.about_id) {
//             // Fetch the paragraph data using the about_id
//             const data = await fetchDataByIds(
//               parsedData.about_id,
//               GET_TEXT_VIA_IDS
//             );
//             const aaaaa = "If you're looking for random paragraphs, you've come to the right place. When a random word or a random sentence isn't quite enough, the next logical step is to find a random paragraph. We created the Random Paragraph Generator with you in mind. The process is quite simple. Choose the number of random paragraphs you'd like to see and click the button. Your chosen number of paragraphs will instantly sed with an introductory sentence, then followed by two or more supporting sentences about the idea. A short paragraph may not reach even 50 words while long paragraphs can be over 400 words long, but generally speaking they tend to be approximately 200 words in length."
//             setAboutData(aaaaa);
//             console.log("About data:", data[0].content);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching about data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAboutData();
//   }, []);

//   // If no about data or loading, don't render anything
//   if (loading || !aboutData) {
//     return null;
//   }

//   // Function to limit text to two lines (approx. 180 characters)
//   const getLimitedText = (text) => {
//     if (!expanded && text.length > 180) {
//       return text.substring(0, 180) + "...";
//     }
//     return text;
//   };

//   return (
//     <div className="mt-4 mb-6">
//       <div className="text-gray-700">
//         {getLimitedText(aboutData || "")}
//       </div>
      
//       {(aboutData?.length > 180) && (
//         <Button 
//           variant="link" 
//           className="p-0 h-auto text-primary-500 mt-1"
//           onClick={() => setExpanded(!expanded)}
//         >
//           {expanded ? "Read less" : "Read more"}
//         </Button>
//       )}
//     </div>
//   );
// }