export async function getTheme() {
    let PaddleColor : string;
    let MatchBall : string;
    
    try {
        const response = await fetch("/api/paddle-ball", {
        method: "GET",
        credentials: "include", // Include cookies in the request
        });
    
        if (!response.ok) {
            throw new Error("Failed to fetch offline data");
        }
    
        let data: any;
        try {
            data = await response.json();
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return;
        }
        if (!data) {
            throw new Error("No data found");
        }
        
        PaddleColor = data.paddlecolor; // Default paddle color
        MatchBall = data.matchball; // Default ball image
    }
    catch (error) {
        console.error("Error fetching offline data:", error);
        return;
    }
    return {
        PaddleColor,
        MatchBall
    };
}