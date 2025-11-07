export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  views: number;
  likes: number;
  tags?: string[];
  status?: "published" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsComment {
  id: string;
  articleId: number;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  status: "approved" | "pending" | "hidden";
}

export const mockArticles: NewsArticle[] = [
  {
    id: 1,
    title: "10 Dấu Hiệu Cảnh Báo Sức Khỏe Tim Mạch Bạn Cần Biết",
    excerpt: "Tim mạch là một trong những bệnh nguy hiểm nhất. Hãy cùng tìm hiểu các dấu hiệu cảnh báo sớm để bảo vệ sức khỏe của bạn.",
    content: `<p>Bệnh tim mạch là nguyên nhân hàng đầu gây tử vong trên toàn thế giới. Tuy nhiên, nhiều người không nhận ra các dấu hiệu cảnh báo sớm, dẫn đến việc phát hiện muộn và điều trị khó khăn hơn.</p>

<h2>1. Đau Ngực Hoặc Khó Chịu Ở Ngực</h2>
<p>Đau ngực là dấu hiệu phổ biến nhất của bệnh tim. Cơn đau có thể xảy ra ở giữa hoặc bên trái ngực, kéo dài vài phút hoặc biến mất rồi quay lại. Bạn có thể cảm thấy áp lực, nén chặt, hoặc cảm giác đầy đầy.</p>

<h2>2. Khó Thở</h2>
<p>Khó thở khi nghỉ ngơi hoặc khi hoạt động nhẹ có thể là dấu hiệu của suy tim hoặc bệnh động mạch vành. Nếu bạn thường xuyên phải dừng lại để thở khi leo cầu thang, hãy chú ý.</p>

<h2>3. Mệt Mỏi Bất Thường</h2>
<p>Mệt mỏi cực độ, đặc biệt là ở phụ nữ, có thể là dấu hiệu sớm của vấn đề tim mạch. Nếu bạn cảm thấy kiệt sức sau những hoạt động bình thường, đây có thể là dấu hiệu cảnh báo.</p>

<h2>4. Chóng Mặt Hoặc Ngất Xỉu</h2>
<p>Tim không bơm đủ máu lên não có thể gây chóng mặt hoặc ngất xỉu. Đây là dấu hiệu nghiêm trọng cần được kiểm tra ngay.</p>

<h2>5. Đau Ở Cánh Tay, Lưng, Cổ, Hoặc Hàm</h2>
<p>Đau tim có thể gây đau ở các bộ phận khác của cơ thể, không chỉ ở ngực. Đau có thể lan ra cánh tay, đặc biệt là cánh tay trái, lưng, cổ, hoặc hàm.</p>

<h2>6. Nhịp Tim Bất Thường</h2>
<p>Tim đập nhanh, đập không đều, hoặc cảm giác "rung rung" trong ngực có thể là dấu hiệu của rối loạn nhịp tim.</p>

<h2>7. Sưng Ở Chân, Mắt Cá Chân, Hoặc Bàn Chân</h2>
<p>Sưng có thể xảy ra khi tim không bơm máu hiệu quả, khiến chất lỏng tích tụ trong các mô.</p>

<h2>8. Đổ Mồ Hôi Lạnh</h2>
<p>Đổ mồ hôi lạnh không rõ nguyên nhân, đặc biệt kèm theo đau ngực, là dấu hiệu nghiêm trọng cần được chú ý.</p>

<h2>9. Buồn Nôn Hoặc Khó Tiêu</h2>
<p>Một số người, đặc biệt là phụ nữ, có thể trải qua buồn nôn hoặc khó tiêu như một triệu chứng của cơn đau tim.</p>

<h2>10. Ho Mãn Tính</h2>
<p>Ho mãn tính, đặc biệt là ho ra chất nhầy màu trắng hoặc hồng, có thể là dấu hiệu của suy tim.</p>

<h2>Khi Nào Cần Tìm Kiếm Sự Chăm Sóc Y Tế?</h2>
<p>Nếu bạn gặp bất kỳ dấu hiệu nào ở trên, đặc biệt là đau ngực, khó thở, hoặc ngất xỉu, hãy tìm kiếm sự chăm sóc y tế ngay lập tức. Phát hiện sớm và điều trị kịp thời có thể cứu sống bạn.</p>

<p>Ngoài ra, hãy thực hiện khám sức khỏe định kỳ, duy trì lối sống lành mạnh với chế độ ăn uống cân bằng, tập thể dục thường xuyên, và tránh hút thuốc để giảm nguy cơ mắc bệnh tim mạch.</p>`,
    author: "BS. Nguyễn Văn A",
    category: "health",
    date: "2025-01-15",
    readTime: "5 phút",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
    featured: true,
    views: 1250,
    likes: 89,
  },
  {
    id: 2,
    title: "Cách Phòng Ngừa Cảm Cúm Mùa Đông Hiệu Quả",
    excerpt: "Mùa đông là thời điểm dễ mắc cảm cúm. Hãy áp dụng các biện pháp phòng ngừa sau để bảo vệ bản thân và gia đình.",
    content: `<p>Mùa đông là thời điểm mà các bệnh cảm cúm bùng phát mạnh mẽ. Với khí hậu lạnh và độ ẩm thấp, virus cảm cúm có thể dễ dàng lây lan và gây bệnh. Tuy nhiên, với những biện pháp phòng ngừa đúng cách, bạn có thể giảm thiểu đáng kể nguy cơ mắc bệnh.</p>

<h2>1. Tiêm Phòng Vaccine Cúm</h2>
<p>Tiêm phòng vaccine cúm là biện pháp hiệu quả nhất để phòng ngừa bệnh cúm. Vaccine nên được tiêm hàng năm, tốt nhất là vào đầu mùa thu, trước khi mùa cúm bắt đầu.</p>

<h2>2. Rửa Tay Thường Xuyên</h2>
<p>Rửa tay bằng xà phòng và nước ít nhất 20 giây, đặc biệt sau khi ho, hắt hơi, hoặc chạm vào các bề mặt công cộng. Nếu không có xà phòng, hãy sử dụng dung dịch sát khuẩn tay có chứa ít nhất 60% cồn.</p>

<h2>3. Tránh Chạm Vào Mặt</h2>
<p>Virus cảm cúm có thể xâm nhập vào cơ thể qua mắt, mũi và miệng. Tránh chạm tay vào những vùng này, đặc biệt khi tay chưa được rửa sạch.</p>

<h2>4. Giữ Khoảng Cách An Toàn</h2>
<p>Tránh tiếp xúc gần với người bị ốm. Nếu bạn bị ốm, hãy ở nhà để tránh lây lan cho người khác. Giữ khoảng cách ít nhất 1 mét với người có triệu chứng.</p>

<h2>5. Tăng Cường Hệ Miễn Dịch</h2>
<p>Một hệ miễn dịch khỏe mạnh sẽ giúp bạn chống lại virus tốt hơn. Hãy:</p>
<ul>
  <li>Ngủ đủ 7-9 giờ mỗi đêm</li>
  <li>Ăn uống cân bằng với nhiều trái cây và rau củ</li>
  <li>Tập thể dục thường xuyên</li>
  <li>Quản lý căng thẳng</li>
  <li>Bổ sung vitamin D nếu cần thiết</li>
</ul>

<h2>6. Vệ Sinh Môi Trường Sống</h2>
<p>Làm sạch và khử trùng các bề mặt thường xuyên chạm vào như tay nắm cửa, công tắc đèn, điện thoại, và bàn phím. Virus có thể sống trên bề mặt trong vài giờ đến vài ngày.</p>

<h2>7. Đeo Khẩu Trang</h2>
<p>Khi ở nơi công cộng hoặc tiếp xúc với người có triệu chứng, đeo khẩu trang có thể giúp bảo vệ bạn khỏi virus trong không khí.</p>

<h2>8. Duy Trì Lối Sống Lành Mạnh</h2>
<p>Không hút thuốc, hạn chế uống rượu, và tránh thức khuya. Những thói quen này có thể làm suy yếu hệ miễn dịch của bạn.</p>

<h2>Khi Nào Cần Tìm Kiếm Sự Chăm Sóc Y Tế?</h2>
<p>Nếu bạn có các triệu chứng nghiêm trọng như sốt cao, khó thở, đau ngực, hoặc các triệu chứng không cải thiện sau vài ngày, hãy liên hệ với bác sĩ ngay lập tức.</p>`,
    author: "BS. Trần Thị B",
    category: "prevention",
    date: "2025-01-14",
    readTime: "4 phút",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    views: 980,
    likes: 67,
  },
  {
    id: 3,
    title: "Xu Hướng Điều Trị Ung Thư Bằng Liệu Pháp Miễn Dịch",
    excerpt: "Liệu pháp miễn dịch đang mở ra những hy vọng mới trong điều trị ung thư. Tìm hiểu về phương pháp này và hiệu quả của nó.",
    content: `<p>Liệu pháp miễn dịch (Immunotherapy) là một trong những bước tiến lớn nhất trong điều trị ung thư trong những thập kỷ gần đây. Phương pháp này không trực tiếp tấn công tế bào ung thư như hóa trị hay xạ trị, mà thay vào đó, nó giúp hệ thống miễn dịch của cơ thể tự nhận biết và tiêu diệt tế bào ung thư.</p>

<h2>Liệu Pháp Miễn Dịch Là Gì?</h2>
<p>Liệu pháp miễn dịch là phương pháp điều trị ung thư sử dụng hệ thống miễn dịch của chính bệnh nhân để chống lại ung thư. Hệ thống miễn dịch thường có khả năng phát hiện và tiêu diệt các tế bào bất thường, nhưng tế bào ung thư có thể "ẩn nấp" khỏi hệ miễn dịch.</p>

<h2>Các Loại Liệu Pháp Miễn Dịch</h2>

<h3>1. Checkpoint Inhibitors</h3>
<p>Đây là loại phổ biến nhất của liệu pháp miễn dịch. Chúng hoạt động bằng cách "gỡ bỏ" các điểm kiểm soát (checkpoints) mà tế bào ung thư sử dụng để ẩn nấp khỏi hệ miễn dịch. Ví dụ: Pembrolizumab, Nivolizumab.</p>

<h3>2. CAR-T Cell Therapy</h3>
<p>Phương pháp này lấy tế bào T từ bệnh nhân, biến đổi chúng trong phòng thí nghiệm để nhận biết và tấn công tế bào ung thư, sau đó truyền lại vào cơ thể bệnh nhân.</p>

<h3>3. Vaccine Điều Trị Ung Thư</h3>
<p>Khác với vaccine phòng ngừa, vaccine điều trị ung thư được thiết kế để kích thích hệ miễn dịch tấn công các tế bào ung thư hiện có.</p>

<h2>Hiệu Quả Của Liệu Pháp Miễn Dịch</h2>
<p>Liệu pháp miễn dịch đã cho thấy kết quả ấn tượng trong điều trị nhiều loại ung thư, bao gồm:</p>
<ul>
  <li>Ung thư phổi</li>
  <li>Ung thư da (melanoma)</li>
  <li>Ung thư thận</li>
  <li>Ung thư bàng quang</li>
  <li>Một số loại ung thư máu</li>
</ul>

<h2>Lợi Ích Của Liệu Pháp Miễn Dịch</h2>
<ul>
  <li><strong>Hiệu quả lâu dài:</strong> Một khi hệ miễn dịch học được cách nhận biết tế bào ung thư, nó có thể tiếp tục bảo vệ cơ thể trong thời gian dài.</li>
  <li><strong>Ít tác dụng phụ hơn:</strong> So với hóa trị truyền thống, liệu pháp miễn dịch thường có ít tác dụng phụ nghiêm trọng hơn.</li>
  <li><strong>Điều trị cá nhân hóa:</strong> Được điều chỉnh theo đặc điểm của từng bệnh nhân.</li>
</ul>

<h2>Tác Dụng Phụ</h2>
<p>Mặc dù thường ít nghiêm trọng hơn, liệu pháp miễn dịch vẫn có thể gây ra các tác dụng phụ như:</p>
<ul>
  <li>Mệt mỏi</li>
  <li>Phát ban da</li>
  <li>Tiêu chảy</li>
  <li>Viêm phổi</li>
  <li>Viêm gan</li>
</ul>

<h2>Tương Lai Của Liệu Pháp Miễn Dịch</h2>
<p>Các nhà nghiên cứu đang tiếp tục phát triển và cải thiện liệu pháp miễn dịch. Tương lai có thể bao gồm:</p>
<ul>
  <li>Kết hợp với các phương pháp điều trị khác</li>
  <li>Phát triển các loại thuốc mới hiệu quả hơn</li>
  <li>Mở rộng ứng dụng cho nhiều loại ung thư hơn</li>
</p>`,
    author: "BS. Lê Văn C",
    category: "treatment",
    date: "2025-01-13",
    readTime: "7 phút",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop",
    views: 2100,
    likes: 156,
  },
  {
    id: 4,
    title: "Sử Dụng Thuốc Kháng Sinh Đúng Cách: Những Điều Cần Biết",
    excerpt: "Kháng sinh là một trong những phát minh vĩ đại của y học, nhưng sử dụng sai cách có thể gây ra nhiều hậu quả nghiêm trọng.",
    content: `<p>Kháng sinh là một trong những phát minh quan trọng nhất của y học hiện đại, cứu sống hàng triệu người mỗi năm. Tuy nhiên, việc sử dụng không đúng cách đã dẫn đến tình trạng kháng kháng sinh, một trong những mối đe dọa lớn nhất đối với sức khỏe toàn cầu.</p>

<h2>Kháng Sinh Là Gì?</h2>
<p>Kháng sinh là các loại thuốc được sử dụng để điều trị nhiễm trùng do vi khuẩn. Chúng hoạt động bằng cách tiêu diệt vi khuẩn hoặc ngăn chặn sự sinh sản của chúng.</p>

<h2>Quan Trọng: Kháng Sinh KHÔNG Điều Trị Virus</h2>
<p>Một trong những sai lầm phổ biến nhất là sử dụng kháng sinh cho các bệnh do virus như cảm lạnh, cảm cúm, hoặc COVID-19. Kháng sinh không có tác dụng với virus và việc sử dụng không cần thiết chỉ làm tăng nguy cơ kháng kháng sinh.</p>

<h2>Nguyên Tắc Sử Dụng Kháng Sinh Đúng Cách</h2>

<h3>1. Chỉ Sử Dụng Khi Có Chỉ Định Của Bác Sĩ</h3>
<p>Luôn luôn tham khảo ý kiến bác sĩ trước khi sử dụng kháng sinh. Bác sĩ sẽ xác định xem bạn có thực sự cần kháng sinh hay không và loại kháng sinh nào phù hợp.</p>

<h3>2. Tuân Thủ Liều Lượng Và Thời Gian</h3>
<p>Uống đúng liều lượng được kê đơn và đúng thời gian. Không tự ý tăng hoặc giảm liều, và không dừng thuốc sớm ngay cả khi bạn cảm thấy đã khỏe hơn.</p>

<h3>3. Hoàn Thành Toàn Bộ Đợt Điều Trị</h3>
<p>Điều quan trọng là phải hoàn thành toàn bộ đợt điều trị, ngay cả khi các triệu chứng đã biến mất. Dừng sớm có thể khiến một số vi khuẩn còn sót lại và phát triển khả năng kháng thuốc.</p>

<h3>4. Không Dùng Lại Thuốc Cũ</h3>
<p>Không bao giờ sử dụng kháng sinh còn sót lại từ đợt điều trị trước. Mỗi lần nhiễm trùng có thể khác nhau và cần loại kháng sinh khác nhau.</p>

<h3>5. Không Chia Sẻ Thuốc</h3>
<p>Không chia sẻ kháng sinh với người khác, ngay cả khi họ có triệu chứng tương tự. Đơn thuốc được kê dành riêng cho từng cá nhân.</p>

<h2>Hậu Quả Của Việc Sử Dụng Sai Cách</h2>

<h3>Kháng Kháng Sinh</h3>
<p>Khi vi khuẩn phát triển khả năng chống lại kháng sinh, các loại thuốc này trở nên kém hiệu quả hoặc hoàn toàn vô hiệu. Điều này có thể dẫn đến:</p>
<ul>
  <li>Nhiễm trùng kéo dài hơn và nghiêm trọng hơn</li>
  <li>Thời gian nằm viện lâu hơn</li>
  <li>Tăng chi phí điều trị</li>
  <li>Tăng nguy cơ tử vong</li>
</ul>

<h2>Các Tác Dụng Phụ Phổ Biến</h2>
<ul>
  <li>Tiêu chảy</li>
  <li>Buồn nôn và nôn</li>
  <li>Phát ban</li>
  <li>Dị ứng (có thể nghiêm trọng)</li>
  <li>Nhiễm trùng nấm men</li>
</ul>

<h2>Làm Thế Nào Để Ngăn Ngừa Nhiễm Trùng?</h2>
<p>Thay vì phụ thuộc vào kháng sinh, hãy:</p>
<ul>
  <li>Rửa tay thường xuyên</li>
  <li>Tiêm phòng đầy đủ</li>
  <li>Chuẩn bị thức ăn an toàn</li>
  <li>Tránh tiếp xúc với người bị ốm</li>
  <li>Giữ vết thương sạch sẽ</li>
</ul>

<h2>Kết Luận</h2>
<p>Kháng sinh là công cụ mạnh mẽ trong y học, nhưng chúng cần được sử dụng một cách có trách nhiệm. Bằng cách tuân theo các nguyên tắc sử dụng đúng cách, chúng ta có thể bảo vệ hiệu quả của kháng sinh cho các thế hệ tương lai.</p>`,
    author: "BS. Phạm Thị D",
    category: "medicine",
    date: "2025-01-12",
    readTime: "6 phút",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop",
    views: 1500,
    likes: 112,
  },
  {
    id: 5,
    title: "Top 5 Xu Hướng Sức Khỏe 2025 Bạn Nên Theo Dõi",
    excerpt: "Năm 2025 mang đến nhiều xu hướng mới trong chăm sóc sức khỏe. Hãy cùng khám phá những điều đáng chú ý nhất.",
    content: `<p>Năm 2025 đánh dấu sự phát triển mạnh mẽ của các công nghệ và phương pháp mới trong chăm sóc sức khỏe. Từ AI trong chẩn đoán đến y học cá nhân hóa, những xu hướng này đang thay đổi cách chúng ta tiếp cận sức khỏe và y tế.</p>

<h2>1. Trí Tuệ Nhân Tạo (AI) Trong Chẩn Đoán Và Điều Trị</h2>
<p>AI đang cách mạng hóa ngành y tế với khả năng phân tích dữ liệu y tế khổng lồ và hỗ trợ bác sĩ trong chẩn đoán. Các hệ thống AI có thể:</p>
<ul>
  <li>Phát hiện ung thư sớm hơn trong hình ảnh y tế</li>
  <li>Dự đoán nguy cơ bệnh tật</li>
  <li>Đề xuất phác đồ điều trị cá nhân hóa</li>
  <li>Giảm thời gian chẩn đoán từ vài tuần xuống vài giờ</li>
</ul>

<h2>2. Y Học Cá Nhân Hóa (Precision Medicine)</h2>
<p>Y học cá nhân hóa sử dụng thông tin di truyền, môi trường và lối sống của từng cá nhân để điều chỉnh phác đồ điều trị. Điều này cho phép:</p>
<ul>
  <li>Điều trị hiệu quả hơn với ít tác dụng phụ hơn</li>
  <li>Phòng ngừa bệnh dựa trên nguy cơ di truyền</li>
  <li>Lựa chọn thuốc phù hợp với từng bệnh nhân</li>
</ul>

<h2>3. Telemedicine Và Chăm Sóc Sức Khỏe Từ Xa</h2>
<p>Đại dịch COVID-19 đã thúc đẩy việc áp dụng telemedicine, và xu hướng này tiếp tục phát triển trong năm 2025:</p>
<ul>
  <li>Khám bệnh từ xa qua video call</li>
  <li>Giám sát sức khỏe tại nhà với thiết bị đeo</li>
  <li>Ứng dụng di động theo dõi sức khỏe</li>
  <li>Chăm sóc sức khỏe tâm thần trực tuyến</li>
</ul>

<h2>4. Sức Khỏe Tâm Thần Được Ưu Tiên</h2>
<p>Sau đại dịch, sức khỏe tâm thần đã trở thành ưu tiên hàng đầu:</p>
<ul>
  <li>Nhiều ứng dụng và nền tảng chăm sóc sức khỏe tâm thần</li>
  <li>Liệu pháp trực tuyến dễ tiếp cận hơn</li>
  <li>Giảm kỳ thị về các vấn đề sức khỏe tâm thần</li>
  <li>Tích hợp chăm sóc sức khỏe tâm thần vào chăm sóc sức khỏe tổng thể</li>
</ul>

<h2>5. Sức Khỏe Môi Trường Và Sức Khỏe Cộng Đồng</h2>
<p>Nhận thức về mối liên hệ giữa sức khỏe và môi trường đang tăng lên:</p>
<ul>
  <li>Giảm thiểu tác động của biến đổi khí hậu lên sức khỏe</li>
  <li>Thực phẩm hữu cơ và bền vững</li>
  <li>Không gian xanh và sức khỏe tâm thần</li>
  <li>Giảm ô nhiễm không khí và nước</li>
</ul>

<h2>Làm Thế Nào Để Theo Dõi Các Xu Hướng Này?</h2>
<p>Để tận dụng tối đa các xu hướng sức khỏe mới:</p>
<ul>
  <li>Giữ thông tin cập nhật từ các nguồn y tế đáng tin cậy</li>
  <li>Thảo luận với bác sĩ về các phương pháp mới</li>
  <li>Sử dụng công nghệ y tế một cách có trách nhiệm</li>
  <li>Tham gia vào các nghiên cứu y tế nếu có thể</li>
</ul>

<h2>Kết Luận</h2>
<p>Các xu hướng sức khỏe 2025 hứa hẹn mang lại những cải thiện đáng kể trong cách chúng ta phòng ngừa, chẩn đoán và điều trị bệnh. Bằng cách theo dõi và áp dụng những tiến bộ này một cách thông minh, chúng ta có thể tận hưởng sức khỏe tốt hơn và chất lượng cuộc sống cao hơn.</p>`,
    author: "BS. Hoàng Văn E",
    category: "trending",
    date: "2025-01-11",
    readTime: "5 phút",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    views: 3200,
    likes: 234,
  },
  {
    id: 6,
    title: "Tầm Quan Trọng Của Khám Sức Khỏe Định Kỳ",
    excerpt: "Khám sức khỏe định kỳ giúp phát hiện sớm các vấn đề sức khỏe và điều trị kịp thời. Đây là thói quen cần thiết cho mọi người.",
    content: `<p>Khám sức khỏe định kỳ là một trong những cách tốt nhất để bảo vệ sức khỏe của bạn. Nhiều người chỉ đến gặp bác sĩ khi họ cảm thấy ốm, nhưng việc khám sức khỏe định kỳ có thể giúp phát hiện các vấn đề sức khỏe trước khi chúng trở nên nghiêm trọng.</p>

<h2>Tại Sao Khám Sức Khỏe Định Kỳ Quan Trọng?</h2>

<h3>1. Phát Hiện Sớm Các Vấn Đề Sức Khỏe</h3>
<p>Nhiều bệnh nghiêm trọng như ung thư, tiểu đường, và bệnh tim có thể không có triệu chứng rõ ràng trong giai đoạn đầu. Khám sức khỏe định kỳ có thể phát hiện những vấn đề này sớm, khi chúng dễ điều trị hơn.</p>

<h3>2. Phòng Ngừa Bệnh Tật</h3>
<p>Bác sĩ có thể đánh giá nguy cơ mắc bệnh của bạn và đưa ra lời khuyên về cách giảm thiểu những rủi ro đó thông qua thay đổi lối sống, tiêm phòng, hoặc các biện pháp phòng ngừa khác.</p>

<h3>3. Theo Dõi Các Chỉ Số Sức Khỏe</h3>
<p>Khám định kỳ giúp theo dõi các chỉ số quan trọng như huyết áp, cholesterol, đường huyết, và cân nặng. Những thay đổi theo thời gian có thể cho thấy các vấn đề sức khỏe tiềm ẩn.</p>

<h3>4. Tiết Kiệm Chi Phí Về Lâu Dài</h3>
<p>Phát hiện và điều trị sớm thường rẻ hơn nhiều so với điều trị khi bệnh đã tiến triển. Ngoài ra, việc phòng ngừa bệnh tật có thể giúp bạn tránh được các chi phí y tế lớn trong tương lai.</p>

<h3>5. Xây Dựng Mối Quan Hệ Với Bác Sĩ</h3>
<p>Khám sức khỏe định kỳ giúp bạn xây dựng mối quan hệ tin cậy với bác sĩ của mình. Bác sĩ sẽ hiểu rõ hơn về lịch sử sức khỏe của bạn và có thể đưa ra lời khuyên phù hợp hơn.</p>

<h2>Khám Sức Khỏe Định Kỳ Bao Gồm Những Gì?</h2>

<h3>Kiểm Tra Tổng Quát</h3>
<ul>
  <li>Đo huyết áp</li>
  <li>Kiểm tra nhịp tim</li>
  <li>Đo chiều cao và cân nặng</li>
  <li>Kiểm tra thể lực tổng thể</li>
</ul>

<h3>Xét Nghiệm Máu</h3>
<ul>
  <li>Công thức máu toàn phần</li>
  <li>Đường huyết</li>
  <li>Cholesterol</li>
  <li>Chức năng gan và thận</li>
</ul>

<h3>Khám Lâm Sàng</h3>
<ul>
  <li>Khám tai, mũi, họng</li>
  <li>Khám tim phổi</li>
  <li>Khám bụng</li>
  <li>Kiểm tra da</li>
</ul>

<h3>Tầm Soát</h3>
<ul>
  <li>Chụp X-quang ngực (nếu cần)</li>
  <li>Điện tâm đồ (ECG)</li>
  <li>Tầm soát ung thư (tùy độ tuổi và giới tính)</li>
</ul>

<h2>Tần Suất Khám Sức Khỏe Định Kỳ</h2>
<ul>
  <li><strong>Người trẻ (20-30 tuổi):</strong> Mỗi 2-3 năm một lần</li>
  <li><strong>Người trung niên (30-50 tuổi):</strong> Mỗi 1-2 năm một lần</li>
  <li><strong>Người cao tuổi (trên 50 tuổi):</strong> Mỗi năm một lần hoặc thường xuyên hơn</li>
</ul>

<h2>Chuẩn Bị Cho Lần Khám Sức Khỏe</h2>
<ul>
  <li>Chuẩn bị danh sách các câu hỏi và mối quan tâm</li>
  <li>Mang theo danh sách thuốc đang sử dụng</li>
  <li>Ghi lại các triệu chứng hoặc thay đổi về sức khỏe</li>
  <li>Mang theo kết quả xét nghiệm hoặc hồ sơ y tế trước đó</li>
</ul>

<h2>Kết Luận</h2>
<p>Khám sức khỏe định kỳ là một khoản đầu tư quan trọng cho sức khỏe của bạn. Đừng đợi đến khi bạn cảm thấy ốm mới đến gặp bác sĩ. Hãy coi khám sức khỏe định kỳ như một phần của thói quen chăm sóc sức khỏe của bạn.</p>`,
    author: "BS. Vũ Thị F",
    category: "prevention",
    date: "2025-01-10",
    readTime: "4 phút",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop",
    views: 890,
    likes: 56,
  },
  {
    id: 7,
    title: "Chế Độ Dinh Dưỡng Cho Người Bệnh Tiểu Đường",
    excerpt: "Dinh dưỡng đóng vai trò quan trọng trong việc kiểm soát bệnh tiểu đường. Tìm hiểu về chế độ ăn phù hợp.",
    content: `<p>Quản lý bệnh tiểu đường đòi hỏi một cách tiếp cận toàn diện, và dinh dưỡng là một trong những yếu tố quan trọng nhất. Một chế độ ăn uống phù hợp có thể giúp kiểm soát đường huyết, duy trì cân nặng khỏe mạnh, và giảm nguy cơ biến chứng.</p>

<h2>Nguyên Tắc Dinh Dưỡng Cho Người Bệnh Tiểu Đường</h2>

<h3>1. Kiểm Soát Carbohydrate</h3>
<p>Carbohydrate có ảnh hưởng trực tiếp đến đường huyết. Người bệnh tiểu đường cần:</p>
<ul>
  <li>Chọn carbohydrate phức hợp (ngũ cốc nguyên hạt, rau, đậu) thay vì carbohydrate đơn giản (đường, bánh kẹo)</li>
  <li>Ăn đúng lượng carbohydrate theo khuyến nghị của bác sĩ hoặc chuyên gia dinh dưỡng</li>
  <li>Phân bổ carbohydrate đều trong các bữa ăn</li>
</ul>

<h3>2. Tăng Cường Chất Xơ</h3>
<p>Chất xơ giúp làm chậm quá trình hấp thu đường, giữ cho đường huyết ổn định hơn:</p>
<ul>
  <li>Rau xanh: rau cải, rau bina, bông cải xanh</li>
  <li>Trái cây: táo, cam, quả mọng (ăn với lượng vừa phải)</li>
  <li>Ngũ cốc nguyên hạt: yến mạch, gạo lứt, quinoa</li>
  <li>Đậu và các loại hạt</li>
</ul>

<h3>3. Chọn Protein Nạc</h3>
<p>Protein giúp no lâu và ít ảnh hưởng đến đường huyết:</p>
<ul>
  <li>Cá: cá hồi, cá thu, cá ngừ</li>
  <li>Thịt nạc: thịt gà, thịt bò nạc</li>
  <li>Đậu và các loại đậu</li>
  <li>Trứng</li>
  <li>Sản phẩm từ sữa ít béo</li>
</ul>

<h3>4. Chất Béo Lành Mạnh</h3>
<p>Chất béo không bão hòa có thể giúp giảm cholesterol và cải thiện sức khỏe tim mạch:</p>
<ul>
  <li>Dầu ô liu</li>
  <li>Quả bơ</li>
  <li>Các loại hạt (hạnh nhân, óc chó)</li>
  <li>Cá béo</li>
</ul>

<h2>Thực Phẩm Nên Tránh</h2>
<ul>
  <li>Đường tinh luyện và thực phẩm có đường</li>
  <li>Đồ uống có đường</li>
  <li>Thực phẩm chế biến sẵn</li>
  <li>Thực phẩm giàu chất béo bão hòa và trans</li>
  <li>Rượu (nên hỏi ý kiến bác sĩ)</li>
</ul>

<h2>Phương Pháp Đĩa Ăn (Plate Method)</h2>
<p>Đây là cách đơn giản để kiểm soát khẩu phần:</p>
<ul>
  <li><strong>1/2 đĩa:</strong> Rau không chứa tinh bột</li>
  <li><strong>1/4 đĩa:</strong> Protein nạc</li>
  <li><strong>1/4 đĩa:</strong> Carbohydrate phức hợp</li>
  <li>Thêm một phần trái cây nhỏ và một ly sữa ít béo</li>
</ul>

<h2>Lời Khuyên Thực Tế</h2>
<ul>
  <li>Ăn đúng giờ và không bỏ bữa</li>
  <li>Ăn chậm, nhai kỹ</li>
  <li>Uống đủ nước</li>
  <li>Đọc nhãn dinh dưỡng khi mua sắm</li>
  <li>Lên kế hoạch bữa ăn trước</li>
  <li>Chuẩn bị thức ăn tại nhà khi có thể</li>
</ul>

<h2>Làm Việc Với Chuyên Gia Dinh Dưỡng</h2>
<p>Mỗi người bệnh tiểu đường có nhu cầu khác nhau. Làm việc với chuyên gia dinh dưỡng có thể giúp bạn:</p>
<ul>
  <li>Tạo một kế hoạch ăn uống cá nhân hóa</li>
  <li>Học cách đếm carbohydrate</li>
  <li>Hiểu cách thức ăn ảnh hưởng đến đường huyết của bạn</li>
  <li>Điều chỉnh chế độ ăn khi cần thiết</li>
</ul>

<h2>Kết Luận</h2>
<p>Quản lý bệnh tiểu đường thông qua dinh dưỡng không có nghĩa là từ bỏ những thực phẩm yêu thích của bạn. Thay vào đó, nó là về việc tìm sự cân bằng và học cách lựa chọn thực phẩm thông minh. Với sự hướng dẫn đúng đắn và cam kết, bạn có thể tận hưởng một chế độ ăn uống ngon miệng và lành mạnh trong khi kiểm soát bệnh tiểu đường của mình.</p>`,
    author: "BS. Đỗ Văn G",
    category: "treatment",
    date: "2025-01-09",
    readTime: "6 phút",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop",
    views: 1750,
    likes: 128,
  },
  {
    id: 8,
    title: "Các Loại Vitamin Cần Thiết Cho Cơ Thể Và Cách Bổ Sung",
    excerpt: "Vitamin là những chất dinh dưỡng thiết yếu. Tìm hiểu về các loại vitamin quan trọng và cách bổ sung đúng cách.",
    content: `<p>Vitamin là những hợp chất hữu cơ mà cơ thể cần với số lượng nhỏ để hoạt động bình thường. Mặc dù cần lượng nhỏ, nhưng thiếu vitamin có thể gây ra các vấn đề sức khỏe nghiêm trọng. Hiểu về các loại vitamin và cách bổ sung chúng đúng cách là rất quan trọng.</p>

<h2>Vitamin Tan Trong Nước</h2>
<p>Những vitamin này không được lưu trữ trong cơ thể và cần được bổ sung thường xuyên.</p>

<h3>Vitamin C</h3>
<p><strong>Chức năng:</strong> Hỗ trợ hệ miễn dịch, chữa lành vết thương, chất chống oxy hóa</p>
<p><strong>Nguồn thực phẩm:</strong> Cam, chanh, ớt chuông, bông cải xanh, dâu tây</p>
<p><strong>Khuyến nghị:</strong> 75-90mg/ngày (người lớn)</p>

<h3>Vitamin B Complex</h3>
<ul>
  <li><strong>B1 (Thiamine):</strong> Chuyển hóa năng lượng - Ngũ cốc nguyên hạt, thịt heo</li>
  <li><strong>B2 (Riboflavin):</strong> Sản xuất năng lượng - Sữa, trứng, rau xanh</li>
  <li><strong>B3 (Niacin):</strong> Chuyển hóa năng lượng - Thịt, cá, các loại hạt</li>
  <li><strong>B6 (Pyridoxine):</strong> Chức năng não - Cá, thịt gia cầm, khoai tây</li>
  <li><strong>B9 (Folate):</strong> Sản xuất tế bào - Rau lá xanh, đậu, ngũ cốc</li>
  <li><strong>B12 (Cobalamin):</strong> Chức năng thần kinh - Thịt, cá, sữa, trứng</li>
</ul>

<h2>Vitamin Tan Trong Chất Béo</h2>
<p>Những vitamin này được lưu trữ trong mô mỡ và gan, và có thể tích tụ nếu dùng quá nhiều.</p>

<h3>Vitamin A</h3>
<p><strong>Chức năng:</strong> Thị lực, hệ miễn dịch, sự phát triển</p>
<p><strong>Nguồn thực phẩm:</strong> Cà rốt, khoai lang, rau bina, gan, sữa</p>
<p><strong>Lưu ý:</strong> Dùng quá liều có thể gây độc</p>

<h3>Vitamin D</h3>
<p><strong>Chức năng:</strong> Hấp thụ canxi, sức khỏe xương, chức năng miễn dịch</p>
<p><strong>Nguồn thực phẩm:</strong> Cá béo, lòng đỏ trứng, thực phẩm tăng cường</p>
<p><strong>Đặc biệt:</strong> Cơ thể có thể tạo vitamin D từ ánh nắng mặt trời</p>
<p><strong>Khuyến nghị:</strong> 600-800 IU/ngày (người lớn)</p>

<h3>Vitamin E</h3>
<p><strong>Chức năng:</strong> Chất chống oxy hóa, bảo vệ tế bào</p>
<p><strong>Nguồn thực phẩm:</strong> Các loại hạt, dầu thực vật, rau lá xanh</p>

<h3>Vitamin K</h3>
<p><strong>Chức năng:</strong> Đông máu, sức khỏe xương</p>
<p><strong>Nguồn thực phẩm:</strong> Rau lá xanh, dầu thực vật, một số loại thịt</p>

<h2>Cách Bổ Sung Vitamin Đúng Cách</h2>

<h3>1. Ưu Tiên Thực Phẩm</h3>
<p>Luôn ưu tiên bổ sung vitamin từ thực phẩm tự nhiên. Thực phẩm không chỉ chứa vitamin mà còn có các chất dinh dưỡng khác và chất xơ.</p>

<h3>2. Chế Độ Ăn Đa Dạng</h3>
<p>Ăn nhiều loại thực phẩm khác nhau để đảm bảo bạn nhận được tất cả các vitamin cần thiết. Mỗi nhóm thực phẩm cung cấp các vitamin khác nhau.</p>

<h3>3. Khi Nào Cần Bổ Sung?</h3>
<p>Bổ sung vitamin có thể cần thiết nếu:</p>
<ul>
  <li>Bạn có chế độ ăn hạn chế (ví dụ: ăn chay, thuần chay)</li>
  <li>Bạn đang mang thai hoặc cho con bú</li>
  <li>Bạn có tình trạng sức khỏe ảnh hưởng đến hấp thụ</li>
  <li>Bạn ít tiếp xúc với ánh nắng mặt trời (cho vitamin D)</li>
  <li>Bác sĩ khuyến nghị</li>
</ul>

<h3>4. Lưu Ý Khi Dùng Thực Phẩm Bổ Sung</h3>
<ul>
  <li>Luôn tham khảo ý kiến bác sĩ trước khi bắt đầu bổ sung</li>
  <li>Chọn các sản phẩm từ nhà sản xuất uy tín</li>
  <li>Không vượt quá liều lượng khuyến nghị</li>
  <li>Chú ý đến tương tác với thuốc</li>
  <li>Vitamin tan trong chất béo có thể tích tụ - cẩn thận với liều lượng</li>
</ul>

<h2>Dấu Hiệu Thiếu Vitamin</h2>
<ul>
  <li>Mệt mỏi không rõ nguyên nhân</li>
  <li>Yếu cơ</li>
  <li>Da khô hoặc phát ban</li>
  <li>Tóc rụng</li>
  <li>Vết thương chậm lành</li>
  <li>Dễ bị bầm tím</li>
</ul>

<h2>Kết Luận</h2>
<p>Vitamin là những chất dinh dưỡng thiết yếu cho sức khỏe. Một chế độ ăn đa dạng và cân bằng thường cung cấp đủ lượng vitamin cần thiết. Tuy nhiên, trong một số trường hợp, bổ sung có thể cần thiết. Luôn tham khảo ý kiến chuyên gia y tế trước khi bắt đầu bất kỳ chế độ bổ sung nào.</p>`,
    author: "BS. Nguyễn Thị H",
    category: "health",
    date: "2025-01-08",
    readTime: "5 phút",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
    views: 1420,
    likes: 95,
  },
];

