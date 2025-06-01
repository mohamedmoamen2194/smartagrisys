"use client"

export function useReports() {
  const downloadReport = (reportType: string, data: any) => {
    let content = ""
    let filename = ""

    switch (reportType) {
      case "disease-detection":
        content = generateDiseaseReport(data)
        filename = `disease-detection-report-${new Date().toISOString().split("T")[0]}.txt`
        break
      case "fruit-sizing":
        content = generateFruitSizingReport(data)
        filename = `fruit-sizing-report-${new Date().toISOString().split("T")[0]}.txt`
        break
      case "inventory":
        content = generateInventoryReport(data)
        filename = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`
        break
      case "orders":
        content = generateOrdersReport(data)
        filename = `orders-report-${new Date().toISOString().split("T")[0]}.csv`
        break
      default:
        content = JSON.stringify(data, null, 2)
        filename = `report-${new Date().toISOString().split("T")[0]}.json`
    }

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { downloadReport }
}

function generateDiseaseReport(data: any) {
  return `DISEASE DETECTION REPORT
Generated: ${new Date().toLocaleString()}

ANALYSIS RESULTS:
Plant Type: Tomato
Disease Detected: Late Blight
Confidence: 98%
Affected Area: 45%
Severity: High
Spread Risk: High

RECOMMENDED ACTIONS:
1. Remove and destroy infected plants immediately
2. Apply fungicide to remaining plants
3. Improve air circulation around plants
4. Water at the base of plants, avoid wetting foliage

ADDITIONAL NOTES:
- Monitor remaining plants closely for signs of spread
- Consider preventive treatments for nearby crops
- Review irrigation practices to prevent future outbreaks
`
}

function generateFruitSizingReport(data: any) {
  return `FRUIT SIZING ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

ANALYSIS RESULTS:
Date: June 1, 2025
Time: 14:36:47
Grade: A

MEASUREMENTS:
Average Diameter: 8cm
Weight (estimated): 150g
Color Uniformity: 95%
Surface Defects: None
Harvest Ready: Yes

RECOMMENDATION:
Fruits are ready for harvest. Grade A classification makes them suitable for premium markets. 
Harvest within 2-3 days for optimal quality.

QUALITY METRICS:
- Size consistency: Excellent
- Color development: Optimal
- Market readiness: Ready for premium sales
`
}

function generateInventoryReport(data: any[]) {
  let csv = "Product,Category,Quantity,Unit,Price,Status,Last Updated\n"
  data.forEach((item) => {
    csv += `"${item.name}","${item.category}",${item.quantity},"${item.unit}",${item.price},"${item.status}","${item.lastUpdated}"\n`
  })
  return csv
}

function generateOrdersReport(data: any[]) {
  let csv = "Order ID,Customer,Product,Quantity,Total,Status,Date\n"
  data.forEach((order) => {
    csv += `"${order.id}","${order.customer}","${order.product}",${order.quantity},${order.total},"${order.status}","${order.date}"\n`
  })
  return csv
}
