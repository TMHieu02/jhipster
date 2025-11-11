package com.demo.service.core;

import com.demo.service.dto.ProductDTO;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class ExcelExportService {

    public byte[] exportProducts(List<ProductDTO> products) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Products");

            createHeaderRow(sheet);
            populateRows(sheet, products, workbook.getCreationHelper());

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createHeaderRow(XSSFSheet sheet) {
        Row headerRow = sheet.createRow(0);

        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        String[] headers = {
            "STT",
            "Name",
            "Description",
            "Price",
            "Stock Quantity",
            "Category",
            "Status",
            "Created Date"
        };

        for (int i = 0; i < headers.length; i++) {
            var cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void populateRows(XSSFSheet sheet, List<ProductDTO> products, CreationHelper creationHelper) {
        CellStyle dateStyle = sheet.getWorkbook().createCellStyle();
        dateStyle.setDataFormat(creationHelper.createDataFormat().getFormat("hh:mm dd-MM-yyyy"));

        int rowIdx = 1;
        int counter = 1;
        for (ProductDTO product : products) {
            Row row = sheet.createRow(rowIdx++);

            row.createCell(0).setCellValue(formatCounter(counter++));
            row.createCell(1).setCellValue(safeString(product.getName()));
            row.createCell(2).setCellValue(safeString(product.getDescription()));

            var priceCell = row.createCell(3);
            if (product.getPrice() != null) {
                priceCell.setCellValue(product.getPrice().doubleValue());
            }

            var stockCell = row.createCell(4);
            if (product.getStockQuantity() != null) {
                stockCell.setCellValue(product.getStockQuantity());
            }

            String category = product.getCategoryName() != null ? product.getCategoryName() : product.getCategoryId();
            row.createCell(5).setCellValue(safeString(category));
            row.createCell(6).setCellValue(Boolean.TRUE.equals(product.getActive()) ? "Active" : "Inactive");

            if (product.getCreatedDate() != null) {
                var createdCell = row.createCell(7);
                Date date = Date.from(product.getCreatedDate());
                createdCell.setCellValue(date);
                createdCell.setCellStyle(dateStyle);
            } else {
                row.createCell(7);
            }
        }

        for (int i = 0; i <= 7; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String safeString(String value) {
        return value == null ? "" : value;
    }

    private String formatCounter(int value) {
        return String.format("%04d", value);
    }
}

